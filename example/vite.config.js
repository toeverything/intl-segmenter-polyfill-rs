import wasm from 'vite-plugin-wasm';
import { defineConfig } from 'vite';
import swc from './vite-plugin-swc.config';

export default defineConfig({
  plugins: [wasm(), swc()],
});
