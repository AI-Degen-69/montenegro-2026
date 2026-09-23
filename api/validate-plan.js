// Shape guard for PUT /api/plan: one corrupt client must not poison the
// shared blob for every visitor. Pure function, covered by node tests.
const MAX_DAYS = 20;
const MAX_STOPS_PER_DAY = 60;
const MAX_STR = 5000;
const STR_FIELDS = ['time', 'dur', 'title', 'kicker', 'body', 'addr', 'maps', 'move', 'alt', 'img'];

const MAX_EXPENSES = 500;
const MAX_MONEY_EUR = 1000000;
// expense fields that reach the DOM (title/payer) or identify an entry
const EXP_STR_FIELDS = [['title', 200], ['payer', 60], ['id', 40]];

// Shared ledger entries are adopted verbatim by every client, so one corrupt
// entry would break the ledger page for all of them - validate before storing.
export function validateExpenses(expenses) {
  if (expenses === undefined) return { ok: true };
  if (!Array.isArray(expenses) || expenses.length > MAX_EXPENSES) {
    return { ok: false, error: 'bad expenses' };
  }
  for (const e of expenses) {
    if (!e || typeof e !== 'object' || Array.isArray(e)) return { ok: false, error: 'bad expense' };
    if (typeof e.amountEur !== 'number' || !Number.isFinite(e.amountEur) || e.amountEur <= 0 || e.amountEur > MAX_MONEY_EUR) {
      return { ok: false, error: 'bad expense amount' };
    }
    for (const [f, max] of EXP_STR_FIELDS) {
      if (e[f] !== undefined && (typeof e[f] !== 'string' || e[f].length > max)) {
        return { ok: false, error: `bad expense field ${f}` };
      }
    }
  }
  return { ok: true };
}

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
  const expenses = validateExpenses(body.expenses);
  if (!expenses.ok) return expenses;
  return { ok: true };
}
