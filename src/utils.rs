use wasm_bindgen::prelude::*;

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[wasm_bindgen(inline_js = "
export function __make_iter(proto) { proto[Symbol.iterator] = function () { return this; }; }
")]
extern "C" {
    #[wasm_bindgen(js_name = "__make_iter")]
    pub fn make_iter(obj: &js_sys::Object);
}
