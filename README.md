# Trivia Quiz Game 🧠

A fun 10-question multiple-choice quiz with a live score and a results screen.

Built with **plain HTML, CSS, and vanilla JavaScript** — no build step and **no API key to configure**.

## Features
- **Multiple-choice questions** with category & difficulty pickers.
- **Live score counter** and a progress bar.
- **Results / summary screen** with a percentage, a per-question breakdown, and a message that changes with your score.
- Answer feedback: your pick and the correct answer are highlighted after you choose.

## Live API
Questions come from the **[Open Trivia DB](https://opentdb.com)** — free, **no API key**. If the API is ever unreachable, the app **falls back to a bundled offline question set** so it never breaks.

## Run locally
Serve over HTTP (so the `fetch` calls work — opening the file directly with `file://` won't run the API requests):

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Or: `npx serve .`

## Deploy
No build step, so hosting is drag-and-drop:
- **Netlify** — drag this folder onto <https://app.netlify.com/drop>.
- **Vercel** — run `vercel` in this folder (framework preset: *Other*, no build command).
- **GitHub Pages** — push this folder as a repo and enable Pages on `main`.

## Files
| File | Purpose |
|------|---------|
| `index.html` | Start, quiz, and results screens |
| `styles.css` | Styling and screen transitions |
| `app.js` | Fetch + decode questions, scoring, results, offline fallback |
