const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calcEndTime, weatherDescription } = require('../utils.cjs');

describe('calcEndTime', () => {
  it('adds minutes-only durations', () => {
    assert.equal(calcEndTime('10:00', '30 דק׳'), '10:30');
  });
  it('adds fractional hours', () => {
    assert.equal(calcEndTime('15:30', '2.5 שע׳'), '18:00');
  });
  it('adds combined hours and minutes', () => {
    assert.equal(calcEndTime('09:15', '1 שע׳ 30 דק׳'), '10:45');
  });
  it('wraps past midnight', () => {
    assert.equal(calcEndTime('23:30', '90 דק׳'), '01:00');
  });
  it('returns null for open-ended durations', () => {
    assert.equal(calcEndTime('22:30', 'פתוח'), null);
  });
  it('returns null for missing input', () => {
    assert.equal(calcEndTime('', '30 דק׳'), null);
    assert.equal(calcEndTime('10:00', ''), null);
  });
});

describe('weatherDescription', () => {
  it('labels known codes', () => {
    assert.equal(weatherDescription(0), 'בהיר');
    assert.equal(weatherDescription(2), 'מעונן חלקית');
    assert.equal(weatherDescription(3), 'מעונן');
    assert.equal(weatherDescription(48), 'ערפל');
    assert.equal(weatherDescription(61), 'גשם');
    assert.equal(weatherDescription(71), 'שלג');
    assert.equal(weatherDescription(95), 'סופות');
  });
  it('falls back for unknown codes', () => {
    assert.equal(weatherDescription(999), 'מזג אוויר משתנה');
  });
});
