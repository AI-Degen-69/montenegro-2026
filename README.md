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

## Storage

Edits live in the visitor's own browser (`localStorage`, key `mne2026.plan.v1`).
Nothing is sent anywhere and edits are not shared between devices or people.
Uploaded photos are downscaled in the browser before being stored.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The whole application — markup, styles, data and logic |
| `img/` | Place photos (440×330), social preview, app icons |
| `manifest.webmanifest` | Add-to-home-screen metadata |

## Local preview

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Credits

Place photos are from Google Maps listings; area photos are from Wikimedia Commons
under free licences. Personal, non-commercial use.
