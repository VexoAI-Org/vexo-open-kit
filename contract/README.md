# Band contract

- [`contract.md`](contract.md): every command you can send to a Vexo Open band and every
  kind of data it sends back, byte by byte. It is at v1.1, which only adds to v1.0 (fast
  motion, stream intervals, a clock); a v1.0 band and a v1.0 client keep working.
- [`test-vectors.json`](test-vectors.json): example frames with their meaning. The
  JavaScript and Python libraries are both tested against this one file, so they cannot
  drift apart. If you write a client in another language, test it against the same file.

The only code that knows the byte format is `js/src/codec.js` and
`python/vexo_open/codec.py`.
