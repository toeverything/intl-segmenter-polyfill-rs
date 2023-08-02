# Intl-Segmenter-Polyfill-rs

## About

This project polyfills the [Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) API for browsers that do not support it.

See the bugzilla issue [here](https://bugzilla.mozilla.org/show_bug.cgi?id=1423593).

## Usage

### Install `wasm-pack`

```
cargo install wasm-pack
```

### Install `icu4x-datagen`

```
cargo install icu_datagen
```

### Generate the data

```
sh icu-datagen.sh
```

### Build with `wasm-pack build`

```
wasm-pack build --target web --release
```

### Run the following commands to standardize the package.json

```
echo "$(jq '.type |= "module" | .files |= ["./*"]' pkg/package.json)" > pkg/package.json
```

### Use it in your project

```js
// Browsers like firefox
import init, { Segmenter } from "intl-segmenter-polyfill-rs";
if (Intl.Segmenter === undefined) {
    // If you don't call init, the wasm won't be load.
    await init().then(
        () => {
            Intl.Segmenter = Segmenter;
            const segmenterFr = new Intl.Segmenter('fr', { granularity: 'sentence' });
            const string1 = 'Hello World. Xin chào thế giới!';
    
            const iterator1 = segmenterFr.segment(string1)[Symbol.iterator]();
    
            console.log(iterator1.next().value.segment);
            // Expected output: 'Hello World. '
    
            console.log(iterator1.next().value.segment);
            // Expected output: 'Xin chào thế giới!'
        }
    );
}
```

## License

Licensed under either of

* Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
* MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.
