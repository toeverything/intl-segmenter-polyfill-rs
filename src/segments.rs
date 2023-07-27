use crate::{utils::make_iter, SegmenterOptions};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
pub struct IterationData {
    pub value: SegmentData,
    pub done: bool,
}

#[derive(Serialize)]
pub struct IterationDataDone {
    pub value: usize,
    pub done: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SegmentData {
    pub segment: String,
    pub index: usize,
    pub input: String,
}

#[wasm_bindgen(skip_typescript)]
#[derive(Clone)]
pub struct Segments {
    segments: Vec<SegmentData>,
    index: usize,
}

#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"

interface Segments {
    /** Returns an iterator to iterate over the segments. */
    [Symbol.iterator](): IterableIterator<SegmentData>;
}

interface SegmentData {
    /** A string containing the segment extracted from the original input string. */
    segment: string;
    /** The code unit index in the original input string at which the segment begins. */
    index: number;
    /** The complete input string that was segmented. */
    input: string;
}

"#;

#[wasm_bindgen]
impl Segments {
    #[wasm_bindgen]
    pub fn next(&mut self) -> Result<JsValue, JsValue> {
        match self.segments.get(self.index) {
            Some(segment) => {
                self.index += 1;
                Ok(serde_wasm_bindgen::to_value(&IterationData {
                    value: segment.clone(),
                    done: false,
                })
                .unwrap())
            }
            None => Ok(serde_wasm_bindgen::to_value(&IterationDataDone {
                value: self.index,
                done: true,
            })
            .unwrap()),
        }
    }
}

impl Segments {
    pub fn new(segments: Vec<SegmentData>) -> Segments {
        let segments = Segments { segments, index: 0 };
        segments
    }
}

#[wasm_bindgen(start)]
pub fn start() -> Result<(), JsValue> {
    let segmenter = crate::Segmenter::new(
        JsValue::from_str("en"),
        serde_wasm_bindgen::to_value(&SegmenterOptions {
            granularity: Some("word".to_string()),
            locale_matcher: Some("best fit".to_string()),
        })
        .unwrap(),
    );
    make_iter(&js_sys::Object::get_prototype_of(
        &segmenter.segment("Hello World!").into(),
    ));
    Ok(())
}
