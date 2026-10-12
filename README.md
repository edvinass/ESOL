# ESOL Trainer

A personal practice site for the [LanguageCert International ESOL](https://www.languagecert.org/en/preparation/practice-material/languagecert-international-esol) exams, A1 to C2.

Phase 1 covers the written exam: listening, reading and writing in the official format, a timed full mock exam, AI writing feedback against the four official criteria, and progress saved in the browser. The speaking simulator is phase 2.

## Setup

```bash
npm install
cp .env.example .env.local   # add your OpenAI API key
npm run dev
```

Without an API key the listening and reading sections work fully. Listening falls back to the browser's built-in voices and writing feedback is turned off.

## Content

Each level page has a **Generate a new practice set** button. It writes a full set in the exam format and records the listening audio with natural voices, showing progress as it goes. Sets without recordings get a **Generate natural voices** button.

- Built-in sets live in `content/sets/<level>/` (the B2 set is hand-written).
- Generated sets and all audio go to `DATA_DIR` (default `./data`): `sets/<level>/` and `audio/<level>/<set-id>/`.

The same generators are available from the command line:

```bash
npm run generate:set -- b1        # one new B1 set with audio
npm run generate:audio -- b2      # record missing audio for B2 sets
npm run validate:content          # check the built-in sets against the spec
```

Generated sets are checked for structure and question counts. Official LanguageCert papers are copyrighted, so all content here is original.

## Deploy to Railway

1. Create a project from this repo. Railway detects Next.js and runs `npm run build` and `npm start`.
2. Add a **volume** to the service, mounted at `/data`, so generated sets and audio survive redeploys.
3. Set these variables:
   - `OPENAI_API_KEY`: your key.
   - `DATA_DIR`: `/data`
4. Generate a domain under Settings, Networking.

Generation runs inside the web server, so keep the service to a single replica.

## Scoring

- Listening and reading: raw marks scaled to 50 each.
- Writing: each task scored 0 to 3 on task fulfilment, grammar, vocabulary and organisation (12 per task), scaled to 50.
- Written total out of 150. Pass is 75, High Pass is 101.

These are estimates, not official results.
