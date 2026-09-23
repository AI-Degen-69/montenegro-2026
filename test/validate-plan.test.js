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

const expense = (over = {}) => ({ id: 'e1', title: 'ארוחה', amountEur: 120, payer: 'אלון', ...over });
const withExpenses = (expenses) => ({ ...body(), expenses });

describe('validatePlanPayload expenses', () => {
  it('accepts a valid expenses array and an omitted one', () => {
    assert.equal(validatePlanPayload(body()).ok, true);
    assert.equal(validatePlanPayload(withExpenses([expense()])).ok, true);
    assert.equal(validatePlanPayload(withExpenses([])).ok, true);
  });
  it('rejects null and non-object entries', () => {
    assert.equal(validatePlanPayload(withExpenses([null])).ok, false);
    assert.equal(validatePlanPayload(withExpenses(['nope'])).ok, false);
  });
  it('rejects a non-numeric, negative or non-finite amountEur', () => {
    assert.equal(validatePlanPayload(withExpenses([expense({ amountEur: 'abc' })])).ok, false);
    assert.equal(validatePlanPayload(withExpenses([expense({ amountEur: -5 })])).ok, false);
    assert.equal(validatePlanPayload(withExpenses([expense({ amountEur: Infinity })])).ok, false);
    assert.equal(validatePlanPayload(withExpenses([expense({ amountEur: undefined })])).ok, false);
  });
  it('rejects oversized expense strings and a non-array expenses field', () => {
    assert.equal(validatePlanPayload(withExpenses([expense({ title: 'x'.repeat(201) })])).ok, false);
    assert.equal(validatePlanPayload(withExpenses([expense({ payer: 7 })])).ok, false);
    assert.equal(validatePlanPayload(withExpenses({})).ok, false);
  });
  it('rejects more than 500 entries', () => {
    const many = Array.from({ length: 501 }, () => expense());
    assert.equal(validatePlanPayload(withExpenses(many)).ok, false);
  });
});
