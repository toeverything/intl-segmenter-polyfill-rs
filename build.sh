#!/bin/sh

wasm-pack build --release --out-dir pkg/esm
wasm-pack build --target nodejs --release --out-dir pkg/cjs
mv pkg/cjs/LICENSE_APACHE pkg/LICENSE_APACHE
mv pkg/cjs/LICENSE_MIT pkg/LICENSE_MIT
mv pkg/cjs/README.md pkg/README.md
rm pkg/cjs/package.json
rm pkg/cjs/.gitignore
mv pkg/esm/package.json pkg/package.json
rm pkg/esm/.gitignore
cat <<EOF >>pkg/cjs/intl_segmenter_polyfill_rs.js
function __make_iter(proto) { proto[Symbol.iterator] = function () { return this; }};
EOF
cat <<EOF >>pkg/esm/intl_segmenter_polyfill_rs_bg.js
function __make_iter(proto) { proto[Symbol.iterator] = function () { return this; }};
EOF

echo "$(jq --argjson FILES $(ls pkg | jq -R -s -c 'split("\n")[:-1]') \
 '.files |= $FILES |
  .main |= "./cjs/intl_segmenter_polyfill_rs.js" |
  .module |= "./esm/intl_segmenter_polyfill_rs.js" |
  .types |= "./cjs/intl_segmenter_polyfill_rs.d.ts" |
  .exports.".".import.types |= "./esm/intl_segmenter_polyfill_rs.d.ts" |
  .exports.".".import.default |= "./esm/intl_segmenter_polyfill_rs.js" |
  .exports.".".require.types |= "./esm/intl_segmenter_polyfill_rs.d.ts" |
  .exports.".".require.default |= "./cjs/intl_segmenter_polyfill_rs.js" |
  .sideEffects[0] |= "./esm/intl_segmenter_polyfill_rs.js"' \
 pkg/package.json)" > pkg/package.json
