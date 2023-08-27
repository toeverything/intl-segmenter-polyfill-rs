import { expect, test } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('#polyfill-status');
  expect(await page.innerText('#polyfill-status')).toBe(
    'You are using intl-segmenter-polyfill-rs polyfilled Intl.Segmenter.'
  );
  expect(await page.innerText('#segmenter-sentence-0')).toBe('Hello World.');
  expect(await page.innerText('#segmenter-sentence-1')).toBe(
    'Xin chào thế giới!'
  );
  expect(await page.innerText('#segmenter-word-0')).toBe('Hello');
  expect(await page.innerText('#segmenter-word-1')).toBe('\xa0');
  expect(await page.innerText('#segmenter-word-2')).toBe('World');
  expect(await page.innerText('#segmenter-word-3')).toBe('.');
  expect(await page.innerText('#segmenter-word-4')).toBe('\xa0');
  expect(await page.innerText('#segmenter-word-5')).toBe('Xin');
  expect(await page.innerText('#segmenter-word-6')).toBe('\xa0');
  expect(await page.innerText('#segmenter-word-7')).toBe('chào');
  expect(await page.innerText('#segmenter-word-8')).toBe('\xa0');
  expect(await page.innerText('#segmenter-word-9')).toBe('thế');
  expect(await page.innerText('#segmenter-word-10')).toBe('\xa0');
  expect(await page.innerText('#segmenter-word-11')).toBe('giới');
});
