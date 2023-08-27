import * as IntlSegmeterPolyfill from 'intl-segmenter-polyfill-rs';

const segmenterFr = new IntlSegmeterPolyfill.Segmenter('fr', {
  granularity: 'word',
});
const string1 = 'Que ma joie demeure';

const iterator1 = segmenterFr.segment(string1)[Symbol.iterator]();

console.log(iterator1.next().value.segment);
// Expected output: 'Que'

console.log(iterator1.next().value.segment);
// Expected output: ' '

// Browsers like firefox
if (Intl.Segmenter === undefined) {
  Object.defineProperty(Intl, 'Segmenter', {
    value: IntlSegmeterPolyfill.Segmenter,
    configurable: true,
    writable: true,
  });
  segmenterExample(true, 'sentence');
  segmenterExample(true, 'word');
  const spanNode2 = document.createElement('span');
  spanNode2.innerText =
    'You are using intl-segmenter-polyfill-rs polyfilled Intl.Segmenter.';
  spanNode2.id = 'polyfill-status';
  document.body.appendChild(spanNode2);
  document.body.appendChild(document.createElement('br'));
} else {
  segmenterExample(false, 'sentence');
  segmenterExample(false, 'word');
  const spanNode2 = document.createElement('span');
  spanNode2.innerText =
    'You are using intl-segmenter-polyfill-rs with no polyfill applied to your browser as itself support segmenter.';
  spanNode2.id = 'polyfill-status';
  document.body.appendChild(spanNode2);
  document.body.appendChild(document.createElement('br'));
}

function segmenterExample(
  polyfilled: boolean,
  granularity: Intl.SegmenterOptions['granularity']
) {
  const segmenterFr = new (polyfilled ? Intl : IntlSegmeterPolyfill).Segmenter(
    'fr',
    { granularity }
  );
  const string = 'Hello World. Xin chào thế giới!';
  const spanNode = document.createElement('span');
  spanNode.innerText =
    'Splitting "' + string + '" with granularity ' + granularity + ':';
  document.body.appendChild(spanNode);
  document.body.appendChild(document.createElement('br'));

  const iterator = segmenterFr.segment(string)[Symbol.iterator]();

  const array = Array.from(iterator).map(
    ele => (ele as IntlSegmeterPolyfill.SegmentData).segment
  );

  const list = document.createElement('ol');
  document.body.appendChild(list);
  array.map((seg, index) => {
    const spanNode = document.createElement('li');
    spanNode.id = `segmenter-${granularity}-${index}`;
    spanNode.innerText = seg !== ' ' ? seg : '\xa0';
    list.appendChild(spanNode);
  });
  document.body.appendChild(document.createElement('br'));
}
