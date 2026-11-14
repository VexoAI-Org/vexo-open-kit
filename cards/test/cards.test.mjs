import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeQr } from '../qr.mjs';
import { parseBands, bandUrl, bandName, bandId, renderCards, DASHBOARD_URL, DASHBOARD_LIVE, notLiveNote } from '../generate.mjs';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { NAME_PREFIX } from '../../js/src/codec.js';

test('parseBands handles ranges, lists, duplicates', () => {
  assert.deepEqual(parseBands('1-3, 9,042,2'), [1, 2, 3, 9, 42]);
  assert.equal(parseBands('1-90').length, 90);
  assert.throws(() => parseBands('5-1'));
  assert.throws(() => parseBands('abc'));
  assert.throws(() => parseBands(''));
});

test('bandUrl pads the number and keeps existing query', () => {
  assert.equal(bandUrl('https://example.org/dashboard/', 42), 'https://example.org/dashboard/?band=42');
  assert.equal(bandUrl('https://example.org/dashboard/', 7), 'https://example.org/dashboard/?band=07');
  assert.equal(bandUrl('https://example.org/dashboard/', 120), 'https://example.org/dashboard/?band=120');
  for (const bad of ['https://example.org/d/?x=1', 'https://example.org/d/#frag', 'https://user:pw@example.org/d/'])
    assert.throws(() => bandUrl(bad, 7), /plain address/);
  assert.throws(() => bandUrl('http://example.org/', 1));
  assert.equal(bandName(5), `${NAME_PREFIX}05`);
});

test('QR size follows the version and has finder patterns', () => {
  const m = encodeQr('HELLO');
  assert.equal(m.length, 21);
  const long = encodeQr('https://example.org/dashboard/?band=42');
  assert.equal(bandUrl('https://example.org/dashboard/', 7), 'https://example.org/dashboard/?band=07');
  assert.equal(bandUrl('https://example.org/dashboard/', 120), 'https://example.org/dashboard/?band=120');
  assert.equal((long.length - 17) % 4, 0);
  for (const [x, y] of [[3, 3], [long.length - 4, 3], [3, long.length - 4]]) assert.equal(long[y][x], true);
  // version 7 has alignment patterns centred on 6/22/38 (regression: wrong spacing broke v7+ codes)
  const v7 = encodeQr('x'.repeat(110));
  assert.equal(v7.length, 45);
  for (const [x, y] of [[22, 22], [38, 38], [22, 38], [38, 22], [6, 22], [22, 6]]) {
    assert.equal(v7[y][x], true);
    assert.equal(v7[y][x + 1], false);
    assert.equal(v7[y + 2][x + 2], true);
  }
  assert.throws(() => encodeQr('x'.repeat(400)));
});

test('renderCards makes one card per band', () => {
  const html = renderCards(parseBands('1-90'), 'https://example.org/dashboard/');
  assert.equal(html.match(/<section class="card"/g).length, 90);
  assert.ok(html.includes(`${NAME_PREFIX}<b>90</b>`));
  assert.ok(!/https?:\/\/(?!example\.org|www\.w3\.org\/2000\/svg)/.test(html), 'no external resources');
});

test('every card link is exactly <https address>?band=XX', () => {
  const bands = parseBands('1-120');      // two-digit and three-digit numbers
  const html = renderCards(bands, DASHBOARD_URL);
  const urls = [...html.matchAll(/data-url="([^"]*)"/g)].map((m) => m[1]);
  assert.equal(urls.length, 120);
  assert.equal(urls[6], `${DASHBOARD_URL}?band=07`);
  assert.equal(urls[119], `${DASHBOARD_URL}?band=120`);
  assert.ok(html.includes(`${NAME_PREFIX}<b>07</b>`) && html.includes(`${NAME_PREFIX}<b>120</b>`));
  urls.forEach((url, i) => {
    assert.match(url, /^https:\/\/[a-z0-9.-]+\/[A-Za-z0-9._\/-]*\?band=\d{2,3}$/);
    assert.equal(url, `${DASHBOARD_URL}?band=${bandId(bands[i])}`);
  });
});

test('one constant says whether the hosted dashboard is switched on, and the generator says so while it is not', () => {
  assert.equal(typeof DASHBOARD_LIVE, 'boolean');
  // the two constants are plain one-line statements, so the docs test (examples/test/test_docs.py) can read them
  const source = readFileSync(new URL('../generate.mjs', import.meta.url), 'utf8');
  assert.match(source, /^export const DASHBOARD_URL = 'https:\/\/[^']+\/';$/m);
  assert.match(source, /^export const DASHBOARD_LIVE = (true|false);$/m);
  assert.equal(notLiveNote(undefined, true), '');
  assert.equal(notLiveNote('https://example.org/d/', false), '');           // somebody else's address: their business
  for (const url of [undefined, DASHBOARD_URL]) {
    assert.match(notLiveNote(url, false), /^Note: the dashboard is not online at https:\S+ yet, so the QR codes on these cards lead to an error page/);
    assert.ok(notLiveNote(url, false).includes(DASHBOARD_URL));
  }
  // and the program prints it (or not) after "Wrote ... cards"
  const out = execFileSync(process.execPath, [fileURLToPath(new URL('../generate.mjs', import.meta.url)), '--bands', '1-2', '--out', process.platform === 'win32' ? 'NUL' : '/dev/null'], { encoding: 'utf8' });
  assert.match(out, /^Wrote 2 cards/);
  assert.equal(out.includes('Note: the dashboard is not online'), !DASHBOARD_LIVE);
});
