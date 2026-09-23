import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validatePhotoUpload, validatePhotoLink, validatePhotoId } from '../api/validate-photo.js';

const jpeg = (n = 500) => 'data:image/jpeg;base64,/9j/' + 'a'.repeat(Math.max(0, n - (n % 4)));
const upload = (over = {}) => ({ image: jpeg(), thumb: jpeg(), stopId: 's101', ...over });

describe('validatePhotoUpload', () => {
  it('accepts a well-formed upload', () => {
    const r = validatePhotoUpload(upload());
    assert.equal(r.ok, true);
    assert.equal(r.stopId, 's101');
  });
  it('defaults missing thumb and stopId', () => {
    const r = validatePhotoUpload({ image: jpeg() });
    assert.equal(r.ok, true);
    assert.equal(r.thumb, jpeg());
    assert.equal(r.stopId, '');
  });
  it('rejects non-jpeg images', () => {
    assert.equal(validatePhotoUpload({ image: 'data:image/png;base64,' + 'a'.repeat(500) }).ok, false);
    assert.equal(validatePhotoUpload({ image: 'not-a-data-url' }).ok, false);
    assert.equal(validatePhotoUpload({ image: 'data:image/jpeg;base64,' + 'a'.repeat(500) }).ok, false);
    assert.equal(validatePhotoUpload({}).ok, false);
  });
  it('rejects oversized images', () => {
    assert.equal(validatePhotoUpload(upload({ image: jpeg(2000004) })).ok, false);
  });
  it('rejects oversized stopId', () => {
    assert.equal(validatePhotoUpload(upload({ stopId: 'x'.repeat(65) })).ok, false);
  });
});

describe('validatePhotoLink', () => {
  it('accepts id + stopId, including unlink', () => {
    assert.equal(validatePhotoLink({ id: 'pabc', stopId: 's1' }).ok, true);
    assert.equal(validatePhotoLink({ id: 'pabc', stopId: '' }).ok, true);
  });
  it('rejects bad ids', () => {
    assert.equal(validatePhotoLink({ stopId: 's1' }).ok, false);
    assert.equal(validatePhotoLink({ id: '', stopId: 's1' }).ok, false);
    assert.equal(validatePhotoLink({ id: 'x'.repeat(41), stopId: 's1' }).ok, false);
  });
});

describe('validatePhotoId', () => {
  it('accepts short non-empty strings only', () => {
    assert.equal(validatePhotoId('pabc'), true);
    assert.equal(validatePhotoId(''), false);
    assert.equal(validatePhotoId(null), false);
  });
});
