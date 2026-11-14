#!/usr/bin/env node
// Team cards generator. One printable card per band: big band name, QR code to the
// dashboard, three connect steps. Works offline; QR codes are generated locally.
//
//   node cards/generate.mjs --bands 1-100 --out cards.html

import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { encodeQr, qrToSvg } from './qr.mjs';
import { NAME_PREFIX, bandId, bandName } from '../js/src/codec.js';

// The band name rule (prefix, digits) lives in js/src/codec.js; cards only print it.
export { bandId, bandName };

/** Where the dashboard is hosted. The one place to change it; --url overrides it. */
export const DASHBOARD_URL = 'https://vexoai-org.github.io/vexo-open-kit/';
/**
 * Is that address switched on? false = not yet: it answers "404 not found". Change this one
 * word to true on the day the hosting goes live. While it is false the pages of the kit
 * (README.md, AGENTS.md, docs/) start with the local web server and name the address above
 * only as what the card's QR code opens at the event (examples/test/test_docs.py checks
 * that), and this program says so when it makes cards for it.
 */
export const DASHBOARD_LIVE = false;

const PAGES = { A4: [297, 210], A5: [210, 148], A6: [148, 105], Letter: [279.4, 215.9] }; // landscape, mm

/** "1-5, 9,042,120" -> [1,2,3,4,5,9,42,120] (sorted, unique). */
export function parseBands(spec) {
  const out = new Set();
  for (const part of String(spec).split(',').map((s) => s.trim()).filter(Boolean)) {
    const m = /^(\d{1,3})(?:\s*-\s*(\d{1,3}))?$/.exec(part);
    if (!m) throw new Error(`Cannot read band list entry "${part}". Use numbers and ranges like 1-100,105.`);
    const a = Number(m[1]);
    const b = m[2] === undefined ? a : Number(m[2]);
    if (b < a) throw new Error(`Range "${part}" goes backwards.`);
    for (let n = a; n <= b; n++) out.add(n);
  }
  if (out.size === 0) throw new Error('No band numbers given.');
  return [...out].sort((x, y) => x - y);
}

/** Dashboard link for one band: exactly <base>?band=XX and nothing else. */
export function bandUrl(base, n) {
  const u = new URL(base);
  if (u.protocol !== 'https:' && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1')
    throw new Error('The dashboard URL must be https:// (Web Bluetooth only works on secure pages).');
  if (u.search || u.hash || u.username || u.password)
    throw new Error('The dashboard URL must be a plain address with no "?", "#" or login in it.');
  return `${u.origin}${u.pathname}?band=${bandId(n)}`;
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function renderCards(bands, baseUrl, { page = 'A5', ecc = 'M' } = {}) {
  const dims = PAGES[page];
  if (!dims) throw new Error(`Unknown page size "${page}". Choose one of: ${Object.keys(PAGES).join(', ')}.`);
  const [w, h] = dims;
  const cards = bands
    .map((n) => {
      const url = bandUrl(baseUrl, n);
      return `<section class="card" data-band="${bandId(n)}" data-url="${esc(url)}">
  <header>
    <div class="label">Your band</div>
    <div class="name">${NAME_PREFIX}<b>${bandId(n)}</b></div>
  </header>
  <div class="body">
    <ol class="steps">
      <li><b>Scan</b> the code with a laptop or Android phone (Chrome).</li>
      <li><b>Double-tap</b> the band to wake it up.</li>
      <li><b>Click Connect</b>, pick <span class="nw">${bandName(n)}</span>, and watch it flash.</li>
    </ol>
    <div class="right">
      ${qrToSvg(encodeQr(url, { ecc }))}
      <div class="url">${esc(url)}</div>
    </div>
  </div>
</section>`;
    })
    .join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vexo Open team cards (${bands.length})</title>
<style>
  @page { size: ${w}mm ${h}mm; margin: 0; }
  :root { --u: ${(h / 100).toFixed(3)}mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #111;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .card { width: ${w}mm; height: ${h}mm; padding: calc(7 * var(--u)) calc(9 * var(--u)); display: flex; flex-direction: column;
    overflow: hidden; break-after: page; page-break-after: always; break-inside: avoid; }
  .card:last-child { break-after: auto; page-break-after: auto; }
  .body { flex: 1 1 0; min-height: 0; display: flex; gap: calc(6 * var(--u)); align-items: center; }
  .steps { flex: 1 1 0; min-width: 0; }
  .right { flex: 0 0 calc(54 * var(--u)); text-align: center; }
  .label { font-size: calc(4.5 * var(--u)); letter-spacing: .12em; text-transform: uppercase; color: #555; }
  .name { font-size: calc(14 * var(--u)); line-height: 1; font-weight: 300; white-space: nowrap;
    font-variant-numeric: tabular-nums; margin: calc(1 * var(--u)) 0 calc(2 * var(--u)); }
  .name b { font-weight: 800; }
  .steps { margin: 0; padding: 0; list-style: none; counter-reset: s; font-size: calc(4.6 * var(--u)); line-height: 1.3; }
  .steps li { counter-increment: s; position: relative; padding-left: calc(10 * var(--u)); margin-bottom: calc(3.5 * var(--u)); }
  .steps li::before { content: counter(s); position: absolute; left: 0; top: calc(-0.4 * var(--u));
    width: calc(7 * var(--u)); height: calc(7 * var(--u)); border-radius: 50%; border: calc(0.5 * var(--u)) solid #111;
    font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: calc(4 * var(--u)); }
  .nw { white-space: nowrap; }
  .qr { width: 100%; height: auto; display: block; }
  .url { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: calc(2.3 * var(--u)); color: #555;
    overflow-wrap: anywhere; margin-top: calc(1 * var(--u)); }
  @media screen {
    body { background: #ddd; padding: 8mm; }
    .card { background: #fff; margin: 0 auto 8mm; box-shadow: 0 1px 6px rgba(0,0,0,.25); }
  }
  @media print { .card { box-shadow: none; } }
</style>
</head>
<body>
${cards}
</body>
</html>
`;
}

/** What to tell the person who prints cards for an address that is not switched on yet ('' = nothing). */
export function notLiveNote(url, live = DASHBOARD_LIVE) {
  if (live || (url !== undefined && url !== DASHBOARD_URL)) return '';
  return `Note: the dashboard is not online at ${DASHBOARD_URL} yet, so the QR codes on these cards lead to an `
    + 'error page until it is. Hand the cards out once it is online (then set DASHBOARD_LIVE to true in cards/generate.mjs), '
    + 'or pass --url with an address that works today.';
}

function main(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const m = /^--([a-z]+)(?:=(.*))?$/.exec(argv[i]);
    if (!m) throw new Error(`Unexpected argument "${argv[i]}".`);
    args[m[1]] = m[2] ?? argv[++i];
  }
  if (args.help !== undefined || !args.bands) {
    console.log(`Usage: node cards/generate.mjs --bands 1-100 [--url <dashboard-url>] [--out cards.html] [--page A5|A4|A6|Letter] [--ecc M|L|Q|H]

  --bands  band numbers: ranges and lists, e.g. 1-100 or 1-40,45,50-60
  --url    dashboard address (https), default ${DASHBOARD_URL}. Each card links to <url>?band=XX
  --out    output file (default: cards.html)
  --page   paper size, landscape, one card per page (default: A5)

Open the output in a browser and print with margins "None" and scale 100%.`);
    return args.help !== undefined ? 0 : 1;
  }
  const bands = parseBands(args.bands);
  const out = args.out ?? 'cards.html';
  writeFileSync(out, renderCards(bands, args.url ?? DASHBOARD_URL, { page: args.page ?? 'A5', ecc: args.ecc ?? 'M' }));
  console.log(`Wrote ${bands.length} cards (${bandName(bands[0])} to ${bandName(bands.at(-1))}) to ${out}`);
  const note = notLiveNote(args.url);
  if (note) console.log(note);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exitCode = 1;
  }
}
