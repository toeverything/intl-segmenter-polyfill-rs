#!/bin/sh

icu4x-datagen --keys fallback/supplement/co@1 \
 segmenter/lstm/wl_auto@1 \
 fallback/parents@1 \
 fallback/likelysubtags@1 \
 segmenter/grapheme@1 \
 segmenter/sentence@1 \
 segmenter/word@1 \
 segmenter/dictionary/w_auto@1 \
 --locales full --format mod --out data
