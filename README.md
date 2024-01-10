# Intl-Segmenter-Polyfill-rs

## About

This project polyfills the [Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) API for browsers that do not support it.

See the bugzilla issue [here](https://bugzilla.mozilla.org/show_bug.cgi?id=1423593).

**As firefox 122 will support the API, this project will be archived in a predictable future.**

Packages are available at:

- https://www.npmjs.com/package/intl-segmenter-polyfill-rs
- https://www.npmjs.com/package/intl-segmenter-polyfill-rs-web

## Usage

### Install `wasm-pack`

```
cargo install wasm-pack
```

### Install `binaryen`

Use your package manager to install `binaryen`.

### Install `icu4x-datagen`

```
cargo install icu_datagen
```

### Generate the data

```
bash icu-datagen.sh
```

### Build

```
bash build.sh
```

### Use it in your project

```js
import * as IntlSegmeterPolyfill from "intl-segmenter-polyfill-rs";
// Browsers like firefox
if (Intl.Segmenter === undefined) {
    Intl.Segmenter = IntlSegmeterPolyfill.Segmenter;
    const segmenterFr = new Intl.Segmenter('fr', { granularity: 'sentence' });
    const string1 = 'Hello World. Xin chào thế giới!';

    const iterator1 = segmenterFr.segment(string1)[Symbol.iterator]();

    console.log(iterator1.next().value.segment);
    // Expected output: 'Hello World. '

    console.log(iterator1.next().value.segment);
    // Expected output: 'Xin chào thế giới!'
}
```

### Use it directly in the browser

```html
<!-- Modify your src according to your need -->
<script type="module" src="/node_modules/intl-segmenter-polyfill-rs-web/intl_segmenter_polyfill_rs.js"></script>
```

## License

Licensed under either of

* Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
* MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.
