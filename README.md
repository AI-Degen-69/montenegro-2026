# ארבעה ימים במונטנגרו · 24–27.9.2026

Static, mobile-first Hebrew (RTL) trip itinerary. Plain HTML, CSS and JavaScript —
one page, no build step, no framework. GSAP is loaded from a CDN for the day
transitions; everything else ships with the page.

## What it does

- Four days on a vertical timeline, one day at a time, with animated transitions.
- Every stop: photo of the place, address linked to Google Maps, alternatives if it's full.
- Every transfer between stops: distance, minutes, travel-mode icon, and a
  Google Maps Directions link with origin and destination already filled in.
- A schematic SVG map per day, drawing the route as the day opens.
- Full editing — add, delete, reorder and rewrite any stop, or upload your own photo.

## Shared state

Every visitor reads and writes the same plan through `/api/plan`, a Vercel
function backed by a single JSON blob in Vercel Blob:

- `GET /api/plan` returns `{ days, rev, updatedAt }`.
- `PUT /api/plan` takes `{ days, rev }`; a stale `rev` gets `409` with the
  current state instead of clobbering someone else's edit.

The page polls every 7 seconds while it is visible, so an edit made on one
phone shows up on everyone else's within a few seconds. `localStorage`
(`mne2026.plan.v1`) is only an offline cache. Uploaded photos are downscaled in
the browser to keep the shared document small.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The whole application — markup, styles, data and logic |
| `img/` | Place photos (440×330), social preview, app icons |
| `api/plan.js` | Shared-state endpoint (Vercel function) |
| `manifest.webmanifest` | Add-to-home-screen metadata |

## Local preview

```bash
npm install
vercel dev
```

Static-only preview (no shared state) also works with
`python -m http.server 8000`.

## Deploy

```bash
vercel deploy --prod
```

`BLOB_READ_WRITE_TOKEN` is provided by the linked Vercel Blob store and is not
kept in the repository.

## Credits

Place photos are from Google Maps listings; area photos are from Wikimedia Commons
under free licences. Personal, non-commercial use.
