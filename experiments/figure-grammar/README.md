# Figure grammar (issue #124, experiment 2)

Figures as data, drawn by one renderer in direction D's pen grammar. Zero dependencies; Node 26 runs the TypeScript directly.

```sh
node build.ts                    # renders figures/*.ts into out/index.html (deterministic)
node check.ts figures/*.ts       # validates figure data (builder 2); also takes essays: samples/*.md
```

View the comparison page by serving `experiments/` (the page links D's stylesheet relatively):

```sh
cd experiments && python3 -m http.server 8130 --bind 127.0.0.1
# open http://127.0.0.1:8130/figure-grammar/out/index.html
```

Add a figure: copy `figures/fig3.ts`, change the data, import and render it in `build.ts`. The format is documented in `types.ts`; the drawing constants and their reasons are in `grammar.ts`; `render.ts` returns `{ wide, narrow, table, text, sentence, figure }` as HTML strings.

| File | What |
| --- | --- |
| `types.ts` | the data format |
| `grammar.ts` | constants measured from D, each with its reason |
| `render.ts` | data in, markup out; throws on invalid data |
| `figures/` | the three figures |
| `models/`, `live.js`, `check.ts`, `samples/` | live sentence and publishing check (builder 2) |
| `out/` | generated comparison page, `compare.css`, screenshots |
| `NOTES.md`, `NOTES-live-check.md` | the builders' notes |

Screenshots: `npx -y playwright screenshot --full-page --viewport-size=360,800 <url> out/screenshots/360.png`, and the same at 1280,900.
