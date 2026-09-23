// Shape guard for PUT /api/plan: one corrupt client must not poison the
// shared blob for every visitor. Pure function, covered by node tests.
const MAX_DAYS = 20;
const MAX_STOPS_PER_DAY = 60;
const MAX_STR = 5000;
const STR_FIELDS = ['time', 'dur', 'title', 'kicker', 'body', 'addr', 'maps', 'move', 'alt', 'img'];

export function validatePlanPayload(body) {
  if (!body || !Array.isArray(body.days) || !body.days.length) {
    return { ok: false, error: 'days missing' };
  }
  if (body.days.length > MAX_DAYS) return { ok: false, error: 'too many days' };
  for (const d of body.days) {
    if (!d || !Array.isArray(d.stops)) return { ok: false, error: 'day stops missing' };
    if (d.stops.length > MAX_STOPS_PER_DAY) return { ok: false, error: 'too many stops' };
    for (const s of d.stops) {
      if (!s || typeof s !== 'object') return { ok: false, error: 'bad stop' };
      for (const f of STR_FIELDS) {
        if (s[f] !== undefined && (typeof s[f] !== 'string' || s[f].length > MAX_STR)) {
          return { ok: false, error: `bad stop field ${f}` };
        }
      }
    }
  }
  return { ok: true };
}
