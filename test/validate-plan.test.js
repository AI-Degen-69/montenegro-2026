import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validatePlanPayload } from '../api/validate-plan.js';

const stop = (over = {}) => ({
  id: 's1', time: '10:00', title: 't', body: 'b', ...over
});
const day = (stops = [stop()]) => ({ id: 'd1', stops });
const body = (days = [day()]) => ({ days, rev: 1 });

describe('validatePlanPayload', () => {
  it('accepts a well-formed payload', () => {
    assert.equal(validatePlanPayload(body()).ok, true);
  });
  it('rejects missing or empty days', () => {
    assert.equal(validatePlanPayload({}).ok, false);
    assert.equal(validatePlanPayload({ days: [] }).ok, false);
    assert.equal(validatePlanPayload({ days: 'x' }).ok, false);
  });
  it('rejects too many days', () => {
    const days = Array.from({ length: 21 }, () => day());
    assert.equal(validatePlanPayload({ days }).ok, false);
  });
  it('rejects days without a stops array', () => {
    assert.equal(validatePlanPayload(body([{ id: 'd1' }])).ok, false);
  });
  it('rejects too many stops', () => {
    const stops = Array.from({ length: 61 }, (_, i) => stop({ id: 's' + i }));
    assert.equal(validatePlanPayload(body([day(stops)])).ok, false);
  });
  it('rejects oversized stop strings', () => {
    assert.equal(validatePlanPayload(body([day([stop({ body: 'x'.repeat(5001) })])])).ok, false);
  });
  it('rejects non-object stops', () => {
    assert.equal(validatePlanPayload(body([day(['nope'])])).ok, false);
  });
});
