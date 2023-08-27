mod segments;
mod utils;

use js_sys::TypeError;
use serde::{Deserialize, Serialize};
use utils::set_panic_hook;
use wasm_bindgen::prelude::*;

struct UnstableProvider;
include!("../data/mod.rs");
impl_data_provider!(UnstableProvider);

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

enum GranularitySegmenter {
    GraphemeClusterSegmenter(icu::segmenter::GraphemeClusterSegmenter),
    WordSegmenter(icu::segmenter::WordSegmenter),
    SentenceSegmenter(icu::segmenter::SentenceSegmenter),
}

#[derive(Deserialize, Serialize)]
pub struct SegmenterOptions {
    granularity: Option<String>,
    #[serde(rename = "localeMatcher")]
    locale_matcher: Option<String>,
}

#[wasm_bindgen(skip_typescript)]
pub struct Segmenter {
    segmenter: GranularitySegmenter,
}

#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"

type BCP47LanguageTag = string;

interface SegmenterOptions {
    /** The locale matching algorithm to use. For information about this option, see [Intl page](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_negotiation). */
    localeMatcher?: "best fit" | "lookup" | undefined;
    /** The type of input to be split */
    granularity?: "grapheme" | "word" | "sentence" | undefined;
}

export interface Segmenter {
    /**
     * Returns `Segments` object containing the segments of the input string, using the segmenter's locale and granularity.
     *
     * @param input - The text to be segmented as a `string`.
     *
     * @returns A new iterable Segments object containing the segments of the input string, using the segmenter's locale and granularity.
     */
    segment(input: string): Segments;
}

export const Segmenter: {
    prototype: Segmenter;

    free(): void;

    /**
     * Creates a new `Intl.Segmenter` object.
     *
     * @param locales - A string with a [BCP 47 language tag](http://tools.ietf.org/html/rfc5646), or an array of such strings.
     *  For the general form and interpretation of the `locales` argument,
     *  see the [`Intl` page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation).
     *
     * @param options - An [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter#parameters)
     *  with some or all options of `SegmenterOptions`.
     *
     * @returns [Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segments) object.
     *
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter).
     */
    new(locales?: BCP47LanguageTag | BCP47LanguageTag[], options?: SegmenterOptions): Segmenter;
};

"#;

#[wasm_bindgen]
impl Segmenter {
    #[wasm_bindgen(js_name = "")]
    pub fn segmenter() -> Result<(), JsValue> {
        Err(TypeError::new("Constructor Intl.Segmenter requires 'new'").into())
    }

    #[wasm_bindgen(constructor)]
    #[allow(unused)]
    pub fn new(locales: JsValue, options: JsValue) -> Segmenter {
        serde_wasm_bindgen::Serializer::json_compatible();
        set_panic_hook();
        let segmenter_options =
            serde_wasm_bindgen::from_value(options).unwrap_or(SegmenterOptions {
                granularity: Some("grapheme".to_string()),
                locale_matcher: Some("best fit".to_string()),
            });

        return match segmenter_options
            .granularity
            .unwrap_or("grapheme".to_string())
            .as_str()
        {
            "grapheme" => {
                let segmenter =
                    icu::segmenter::GraphemeClusterSegmenter::try_new_unstable(&UnstableProvider)
                        .expect("Failed to create GraphemeClusterSegmenter");
                Segmenter {
                    segmenter: GranularitySegmenter::GraphemeClusterSegmenter(segmenter),
                }
            }
            "word" => {
                let segmenter =
                    icu::segmenter::WordSegmenter::try_new_auto_unstable(&UnstableProvider)
                        .expect("Failed to create WordSegmenter");
                Segmenter {
                    segmenter: GranularitySegmenter::WordSegmenter(segmenter),
                }
            }
            "sentence" => {
                let segmenter =
                    icu::segmenter::SentenceSegmenter::try_new_unstable(&UnstableProvider)
                        .expect("Failed to create SentenceSegmenter");
                Segmenter {
                    segmenter: GranularitySegmenter::SentenceSegmenter(segmenter),
                }
            }
            _ => panic!("Invalid granularity"),
        };
    }

    pub fn segment(&self, input: &str) -> segments::Segments {
        let segment_indexes: Vec<usize>;
        match &self.segmenter {
            GranularitySegmenter::GraphemeClusterSegmenter(segmenter) => {
                segment_indexes = segmenter.segment_str(input).collect();
            }
            GranularitySegmenter::WordSegmenter(segmenter) => {
                segment_indexes = segmenter.segment_str(input).collect();
            }
            GranularitySegmenter::SentenceSegmenter(segmenter) => {
                segment_indexes = segmenter.segment_str(input).collect();
            }
        }

        let mut segments: Vec<segments::SegmentData> = Vec::new();

        for (index, segment_index) in segment_indexes.iter().enumerate() {
            if index + 1 == segment_indexes.len() {
                break;
            }
            let segment = input[*segment_index..segment_indexes[index + 1]].to_string();
            segments.push(segments::SegmentData {
                segment,
                index: *segment_index,
                input: input.to_string(),
            });
        }

        segments::Segments::new(segments)
    }
}

#[test]
fn test_segmenter() {
    use icu::segmenter::WordSegmenter;
    let segmenter = WordSegmenter::try_new_auto_unstable(&UnstableProvider).expect("Data exists");

    let breakpoints: Vec<usize> = segmenter
        .segment_str("Hello World. Xin chào thế giới!")
        .collect();
    assert_eq!(
        &breakpoints,
        &[0, 5, 6, 11, 12, 13, 16, 17, 22, 23, 28, 29, 35, 36]
    );
}
