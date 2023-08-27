// Port from https://github.com/vitejs/vite-plugin-react-swc
import { type SourceMapPayload } from 'module';
import {
  type Output,
  type ParserConfig,
  type JscTarget,
  transform,
} from '@swc/core';
import { type PluginOption, type UserConfig, type BuildOptions } from 'vite';
import { createRequire } from 'module';

type TransformError = {
  message: string;
  line?: string;
  column?: string;
};

const { resolve } = createRequire(
  typeof __filename !== 'undefined' ? __filename : import.meta.url
);
const refreshContentRE = /\$Refresh(?:Reg|Sig)\$\(/;

type Options = {
  /**
   * Control where the JSX factory is imported from.
   * @default "swc"
   */
  jsxImportSource?: string;
  /**
   * Enable TypeScript decorators. Requires experimentalDecorators in tsconfig.
   * @default false
   */
  tsDecorators?: boolean;
  /**
   * Use SWC plugins. Enable SWC at build time.
   * @default undefined
   */
  plugins?: Array<[string, Record<string, unknown>]>;
};

const isWebContainer = globalThis.process?.versions?.webcontainer;

const swcPlugin = (_options?: Options): PluginOption[] => {
  let hmrDisabled = false;
  const options = {
    jsxImportSource: _options?.jsxImportSource ?? 'swc',
    tsDecorators: _options?.tsDecorators,
    plugins: _options?.plugins
      ? _options?.plugins.map((el): typeof el => [resolve(el[0]), el[1]])
      : undefined,
  };

  return [
    {
      name: 'vite:swc',
      apply: 'serve',
      config: () => ({
        esbuild: false,
      }),
      configResolved(config) {
        if (config.server.hmr === false) {
          hmrDisabled = true;
        }

        const mdxIndex = config.plugins.findIndex(
          p => p.name === '@mdx-js/rollup'
        );
        if (
          mdxIndex !== -1 &&
          mdxIndex > config.plugins.findIndex(p => p.name === 'vite:swc')
        ) {
          throw new Error(
            '[vite:swc] The MDX plugin should be placed before this plugin'
          );
        }

        if (isWebContainer) {
          config.logger.warn(
            '[vite:swc] SWC is currently not supported in WebContainers.'
          );
        }
      },
      transformIndexHtml: () => [
        {
          tag: 'script',
          attrs: { type: 'module' },
        },
      ],
      async transform(code, _id, transformOptions) {
        const id = _id.split('?')[0];
        const refresh = !transformOptions?.ssr && !hmrDisabled;

        const result = await transformWithOptions(id, code, 'es2020', options);
        if (!result) {
          return;
        }

        if (!refresh || !refreshContentRE.test(result.code)) {
          return result;
        }

        const sourceMap: SourceMapPayload = JSON.parse(result.map!);
        sourceMap.mappings = ';;;;;;;;' + sourceMap.mappings;
        return { code: result.code, map: sourceMap };
      },
    },
    options.plugins
      ? {
          name: 'vite:swc',
          apply: 'build',
          enforce: 'pre', // Run before esbuild
          config: userConfig => ({
            build: silenceUseClientWarning(userConfig),
          }),
          transform: async (code, _id) =>
            transformWithOptions(_id.split('?')[0], code, 'esnext', options),
        }
      : {
          name: 'vite:swc',
          apply: 'build',
          config: userConfig => ({
            build: silenceUseClientWarning(userConfig),
            esbuild: {
              jsx: 'automatic',
              jsxImportSource: options.jsxImportSource,
              tsconfigRaw: {
                compilerOptions: { useDefineForClassFields: true },
              },
            },
          }),
        },
  ];
};

const transformWithOptions = async (
  id: string,
  code: string,
  target: JscTarget,
  options: Options
) => {
  const decorators = options?.tsDecorators ?? false;
  const parser: ParserConfig | undefined = id.endsWith('.tsx')
    ? { syntax: 'typescript', tsx: true, decorators }
    : id.endsWith('.ts')
    ? { syntax: 'typescript', tsx: false, decorators }
    : id.endsWith('.jsx')
    ? { syntax: 'ecmascript', jsx: true }
    : id.endsWith('.mdx')
    ? // JSX is required to trigger fast refresh transformations, even if MDX already transforms it
      { syntax: 'ecmascript', jsx: true }
    : undefined;
  if (!parser) {
    return;
  }

  let result: Output;
  try {
    result = await transform(code, {
      filename: id,
      swcrc: false,
      configFile: false,
      sourceMaps: true,
      jsc: {
        target,
        parser,
        experimental: { plugins: options.plugins },
        transform: {
          useDefineForClassFields: true,
        },
      },
    });
  } catch (e: unknown) {
    const { message } = e as TransformError;
    const fileStartIndex = message.indexOf('╭─[');
    if (fileStartIndex !== -1) {
      const match = /:(\d+):(\d+)]/.exec(message.slice(fileStartIndex));
      if (match) {
        (e as TransformError).line = match[1];
        (e as TransformError).column = match[2];
      }
    }

    throw e;
  }

  return result;
};

const silenceUseClientWarning = (userConfig: UserConfig): BuildOptions => ({
  rollupOptions: {
    onwarn(warning, defaultHandler) {
      if (
        warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
        warning.message.includes('use client')
      ) {
        return;
      }

      if (userConfig.build?.rollupOptions?.onwarn) {
        userConfig.build.rollupOptions.onwarn(warning, defaultHandler);
      } else {
        defaultHandler(warning);
      }
    },
  },
});

export default swcPlugin;
