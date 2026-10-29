# Year grid

A one-page year-at-a-glance planner, digitised from a single-page PDF: twelve
months across the top, thirty-one days down the side, ten items on the right.
Fill any day with a flat colour, print it on A4, or keep it in the browser.

No build step, no dependencies — plain HTML, CSS and JavaScript.

## Use it

- **Fill** — pick a colour and click, or drag across the grid.
- **Erase** — choose the erased swatch, then click a filled cell or item.
- **Keys** — `1`–`6` choose a colour, `Backspace` clears the focused cell,
  arrow keys move around the grid, `Home`/`End` jump to the row ends.
- **Items** — click a box to fill it, click the label to rename it.
- **Clear** — clears every fill (labels are kept).
- **Print** — A4 portrait, exactly one page, colours included.

Everything is saved in `localStorage`, so a reload keeps your grid. Data stays
in the browser; nothing is uploaded.

## Deploy

The site is static, so any host works. This repo ships a GitHub Actions
workflow that publishes it to GitHub Pages:

1. Push the files to a repository (default branch `main`).
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The `Deploy to GitHub Pages` workflow publishes on every push.

Your page appears at `https://<user>.github.io/<repo>/`.

To preview locally, open `index.html`, or serve the folder:

```sh
python3 -m http.server 8000
```

## Notes

- The grid is day-of-month × month, so it is year-agnostic — no dates are
  generated and no leap year is assumed.
- The printed sheet is sized in `cqw` units against a 210 mm wide container,
  which keeps the layout proportional on screen and on paper.

## Colours

| Name  | Hex       |
| ----- | --------- |
| Sand  | `#eddfc6` |
| Clay  | `#eeb6a9` |
| Sky   | `#b6d5e7` |
| Sage  | `#c2d9b3` |
| Lilac | `#d5c6e4` |
| Stone | `#cbd0d7` |
