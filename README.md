# Vexo Open kit

## What this repo is

This kit is a reference: instructions, the Bluetooth contract, two small libraries, a
dashboard to check your band, and examples to copy from. It is not a template and it is
not your project.

- **Your project is your own.** Make your own folder and your own repository, in any
  language, on any platform (a web page, Python, a phone app, a game engine), and build
  whatever you want with the band's motion, taps, light and microphone.
- You may copy any file from here into your project (MIT licence).
- You never need to change this repo or push to it.
- You do not want the libraries at all? The contract ([contract/contract.md](contract/contract.md))
  says how to talk to the band directly over Bluetooth.

## The kit in short

Everything you need to build something with a Vexo Open band: a wrist band with a motion
sensor, a microphone and a colour LED. Any laptop or Android phone can connect to it over
Bluetooth, or by USB cable. No app and no account.

> **42 is only our example. Wherever you see 42 in a command, an address or a name, type the
> number written on your band's bag.** Band 7 is `Vexo-HACK-07`, and its dashboard address
> ends in `?band=7`.

- New here? Start with [Getting started](docs/getting-started.md): from nothing to a
  blinking LED in ten minutes.
- Using an AI coding agent? Point it at [AGENTS.md](AGENTS.md). It tells the agent how to
  build your project with this kit, and to ask for your band number first.
- The dashboard is a web page in this kit that shows your band's live data. You open it
  from your own computer: see the next section.
- Your band number is written on the bag your band came in. Number 42 means the band is
  called `Vexo-HACK-42`.

## Try it in one minute (no band needed)

First give the kit a home. Your own programs go in a folder of your own, `my-project`, and
the kit sits inside it, with exactly the name `vexo-open-kit` (a ZIP download can unpack as
`vexo-open-kit-main`: rename it). The order is the same on every page: first the folder,
then the kit goes inside it. No kit on your computer yet? Make a folder `my-project` and
unpack or clone the kit inside it, then open a terminal in `my-project`. The kit is on your
computer already? In a terminal, in the folder where the kit is now, type:

    mkdir my-project
    mv vexo-open-kit my-project/
    cd my-project

(Windows: `move` instead of `mv`.) You now have this, and your terminal is in `my-project/`:

    my-project/
      vexo-open-kit/     this kit, unchanged
      first.py           your own programs and pages go here, later

The kit includes a pretend band (the simulator) that behaves like a real one. Try it:

    python3 vexo-open-kit/examples/python/led.py --sim
    python3 vexo-open-kit/examples/python/motion.py --sim --seconds 3

On Windows, type `python` wherever these pages say `python3`.

Or in a browser: run `python3 -m http.server 8000 --bind 127.0.0.1` in `my-project/`, open
<http://localhost:8000/vexo-open-kit/dashboard/?band=42> in Chrome or Edge, and press
**Try without a band**. (`--bind 127.0.0.1` keeps the server on your own computer. Without
it, everyone on the same Wi-Fi can read the folder. If the command says
`Address already in use`, try another port: `8001` in the command and in the address.
Then change the number in every address on these pages, the links too: a link always
points to 8000.)

## The whole flow, start to finish

Six steps take you from an empty laptop to your own program that hears and acts. Each step
has one command, and each works with a pretend band too (`--sim` in place of the number).
`42` is the example band number (42 = your band number: use the one written on your band's
bag); type the commands in `my-project/` (the folder from the
section above).

| Step | What you do | What you see |
|---|---|---|
| 1. Get the kit | Put the kit in `my-project/vexo-open-kit/`, open a terminal in `my-project/` | The folders listed at the end of this page |
| 2. See the band | `python3 -m http.server 8000 --bind 127.0.0.1`, open <http://localhost:8000/vexo-open-kit/dashboard/?band=42> in Chrome or Edge, double-tap the band, press **Connect** | Live motion, taps, battery; you change the light |
| 3. See your words | In the dashboard, paste your team's Deepgram key and switch on **Live transcript** | What you say appears as text while you talk |
| 4. Run an example | Close the dashboard tab, double-tap the band, `python3 vexo-open-kit/examples/python/led.py 42` (first: `python3 -m pip install bleak`) | The light goes red, green, blue, then blinks white |
| 5. Sound to text to AI | Set your two keys ([how](AGENTS.md#audio-to-text-to-ai)), then `python3 vexo-open-kit/examples/python/ask_the_band.py 42` | You ask a question out loud, the answer is printed |
| 6. Build your own | Copy an example or a project into `my-project/` and change it | Your idea, running on your band |

The band talks to **one program at a time** over Bluetooth: close the dashboard tab before you
run a Python example, and the other way round. Before every connect, **double-tap the band**:
it can then be found for 60 seconds.

**You only ever connect to your own band.** `?band=42` at the end of the dashboard address
makes the browser's list show only `Vexo-HACK-42`, so you cannot pick a neighbour's band by
mistake. Without `?band=` the dashboard first asks you to type your number. In a program,
`Band.connect(42)` looks only for `Vexo-HACK-42` and ignores every other band in the room.
Connect only to your own band. If your band flashes white or its light changes and it was
not you, someone else has connected to it: restart it and tell a helper.

## Get the sound and build with it

The band's microphone is yours to use in three ways, from least to most work:

| You want | Use | Where |
|---|---|---|
| Text of what was said | `speech.listen(band, seconds)` or the live transcript | `examples/python/speech.py`, `examples/python/audio_to_text.py`, the dashboard |
| Text understood by an AI model (an answer, a decision, a summary) | `ai.py` after `speech.listen` | `examples/python/ask_the_band.py`, `voice_commands.py`, `meeting_notes.py` |
| The sound itself, to save or to send to any service you like | `PcmDecoder` in Python, `BandAudio` in a web page: plain sound, 16 000 samples a second, one channel | [docs/speech.md](docs/speech.md), `python/vexo_open/audio.py`, `js/src/audio.js` |

`python3 vexo-open-kit/examples/python/audio_to_text.py 42 --text no` (42 is the example band
number: use yours) saves what the microphone hears as a sound file and sends nothing anywhere: the quickest proof that the
sound is in your hands. Text needs your team's Deepgram key, and the sound then goes to
that company: tell the people near you. While the microphone is on, the band shows a solid
blue light.

## Speech and AI

The band's microphone can become text (with Deepgram) and an AI model can make sense of
that text (with OpenAI). Each team gets a key for both from the organisers. The steps, from
setting the keys to three examples that run with one command, are in one place:
["Audio to text to AI" in AGENTS.md](AGENTS.md#audio-to-text-to-ai).

## Where your own code goes

In `my-project/` itself, never inside the kit folder. `my-project/` is your own repository:

    cd my-project
    git init
    printf 'vexo-open-kit/\n.env\n' >> .gitignore

The `.gitignore` line keeps the kit out of your repository: the kit stays a plain folder
inside `my-project/`, and each teammate downloads the kit into their own `my-project/` the
same way. The second line keeps `.env`, the file with your team's keys, out of your
repository: **`.env` never goes into a commit.** (Building without the kit's libraries? Then
you do not need the kit folder in your project at all.)

 Every command, program and web page
in these pages is written for the layout above, with the terminal in `my-project/`.
[Getting started](docs/getting-started.md#write-your-own-program) shows the first program
for it.

## What is in each folder

| Folder | What it is for | When you use it |
|---|---|---|
| `dashboard/` | A ready web page that connects to your band: live motion, taps, battery, the light, the microphone and a live transcript. | First, to see that your band works. Later, to check the band when your own program misbehaves. You do not edit it. |
| `examples/` | [Short programs, one idea each](examples/README.md): LED, motion, taps, storage, auto-reconnect, microphone to text, text to an AI model. `python/` for Python, `web/` for web pages, `node/` for Node. | To copy from. Run one, read it (most are under 30 lines), copy it into `my-project/` and change it. |
| `projects/` | [Six small complete projects](projects/README.md): a reaction game, a leash, clap lights, a step diary, a fall alarm, a gesture trainer. | When you want a working starting point bigger than an example. Copy one folder into `my-project/` and make it yours. |
| `python/` | The Python library (`vexo_open`): connect, motion, taps, light, microphone, storage, a pretend band. Bluetooth needs `bleak`, USB needs `pyserial`. | Your Python programs import it. You do not edit it. |
| `js/` | The JavaScript library for web pages (Bluetooth and USB in Chrome and Edge) and a pretend band. No dependencies. | Your web pages import it. You do not edit it. |
| `docs/` | [Getting started](docs/getting-started.md), the [library API](docs/api.md) (every call, both languages), [speech and raw sound](docs/speech.md), [using Deepgram with your band](docs/deepgram.md). | When you want to know how to do one thing, or what an error means. |
| `AGENTS.md` | [The guide for AI coding agents](AGENTS.md), and the key setup for people: "Audio to text to AI". | Point your coding agent at it before it writes anything. Read its key section yourself. |
| `env.example` | An empty form for your team's two keys. | Copy it to `my-project/.env` and fill it in. That file stays on your computer. |
| `contract/` | [`contract.md`](contract/contract.md): every command the band understands and every kind of data it sends, byte by byte, with test frames. | Only if you write your own library, in another language for example. |
| `scripts/`, `.githooks/` | The kit's own safety checks. | Maintainers only. |

## Tests

For the kit's maintainers. These commands are typed in the kit folder itself
(`my-project/vexo-open-kit`), not in `my-project/`. The library tests, followed by the
safety checks:

    scripts/check.sh --tests

Or one part at a time:

    node --test js/test/*.test.js dashboard/test/*.test.mjs
    (cd python && python3 -m unittest discover -s tests)
    python3 -m unittest discover -s examples/test
    node --test examples/test/*.mjs
    python3 -m unittest discover -s projects/test
    node --test projects/test/*.test.mjs

The tests use the simulator. They need Python 3.9 or newer and Node 18 or newer, and
nothing else. The project page tests also use Node 22 and Chrome or Edge, and are skipped
without them.

## Contributing / safety checks

Run this once after you clone:

    git config core.hooksPath .githooks

From then on the pre-push hook runs `scripts/check.sh` before anything leaves your computer.
It scans for keys and passwords with [gitleaks](https://github.com/gitleaks/gitleaks#installing)
(install it first), refuses key and firmware files, and checks a private word list that only
the maintainers have. If you do not have that list, push with `KIT_DENY_SKIP=1 git push`;
the same check runs again on the server.

## Licence

MIT. See [LICENSE](LICENSE).
