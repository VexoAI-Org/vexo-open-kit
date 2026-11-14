# Team cards

One printable card per band: the band's name in large type, a QR code that opens the
dashboard for that band, and the three connect steps. This is the organisers' tool; the
command is typed in the kit folder itself.

    node cards/generate.mjs --bands 1-100 --out cards.html

- `--bands` takes ranges and lists: `1-100`, `1-40,45,50-60`.
- `--url` is where the dashboard is hosted (must be https, no `?` in it). The default is the
  `DASHBOARD_URL` constant at the top of `generate.mjs`. Each code points to `<url>?band=42`.
- Next to it is `DASHBOARD_LIVE`. It is `false` until that address is switched on. While
  it is `false` the QR codes lead to an error page, the generator says so each time, and
  the kit's pages tell students to open the dashboard from their own computer instead.
  Set it to `true` on the day the address works: that is the only change needed.
- `--page` is the paper size, landscape, one card per page: `A5` (default), `A4`, `A6`, `Letter`.

Open `cards.html` in a browser and print it with margins set to "None" and scale 100%.
Needs Node 18 or newer. No packages to install and no internet: the QR codes are drawn by
`qr.mjs` in this folder.

Tests: `node --test cards/test/*.mjs`
