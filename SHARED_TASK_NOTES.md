# Self-Improve Loop — shared notes

## Candidate backlog (loop iter 1, 2026-09-23)

### C1 — Extract pure utils + node:test suite [Strong] [PICKED iter 1]
- **Area / Files**: `index.html` (`calcEndTime`, `weatherDescription`) → new `utils.js` + `test/trip-utils.test.js`
- **Problem**: Zero tests in repo; time-calc and weather-label logic live inline in a 2300-line HTML file, untestable and one typo away from wrong end-times on every card.
- **Solution**: Move the two pure functions to a classic-script `utils.js` (works over file:// and static preview), load it before the main script, cover with `node:test` (built-in, no deps).
- **Benefits**: Testability, regression safety for every future itinerary edit.
- **Scope**: ≤3 files, ≤120 lines changed.

### C2 — Validate `days` shape in PUT /api/plan [Worth exploring]
- **Area / Files**: `api/plan.js`
- **Problem**: PUT accepts any non-empty array; one corrupt client payload poisons the shared blob for all visitors (only guard is a 4MB byte cap).
- **Solution**: Validate stops count and per-stop string lengths; 400 on garbage.
- **Benefits**: Shared-state robustness.

### C3 — Service-worker version drift [Speculative]
- **Area / Files**: `sw.js`, `index.html`
- **Problem**: Manual `?v=N` cache-bust strings drift between files.
- **Solution**: Single `ASSET_VER` constant or content-hash naming.
- **Benefits**: Fewer stale-cache incidents.

## Iterations
- (pending) iter 1: C1 on `improve/loop-iter-1-utils-tests`
