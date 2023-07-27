import init, { Segmenter } from "intl-segmenter-polyfill-rs";
await init().then(
    () => {
        const segmenterFr = new Segmenter('fr', { granularity: 'word' });
        const string1 = 'Que ma joie demeure';

        const iterator1 = segmenterFr.segment(string1)[Symbol.iterator]();

        console.log(iterator1.next().value.segment);
        // Expected output: 'Que'

        console.log(iterator1.next().value.segment);
        // Expected output: ' '
    }
);

// Browsers like firefox
if (Intl.Segmenter === undefined) {
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
