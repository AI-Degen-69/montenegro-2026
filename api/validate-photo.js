// Guards for /api/photos: bound image sizes and id shapes so one bad
// client cannot fill the shared album with junk. Pure, covered by node tests.
const MAX_IMG_CHARS = 2000000; // ~1.5MB binary per dataURL
const MAX_STOPID = 64;
const MAX_ID = 40;
const JPEG_PREFIX = 'data:image/jpeg;base64,';

function isJpeg(s) {
  return typeof s === 'string'
    && s.startsWith(JPEG_PREFIX)
    && s.length > JPEG_PREFIX.length + 100
    && s.length <= MAX_IMG_CHARS + JPEG_PREFIX.length;
}

export function validatePhotoUpload(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'bad body' };
  if (!isJpeg(body.image)) return { ok: false, error: 'bad image' };
  if (body.thumb !== undefined && !isJpeg(body.thumb)) return { ok: false, error: 'bad thumb' };
  if (body.stopId !== undefined && (typeof body.stopId !== 'string' || body.stopId.length > MAX_STOPID)) {
    return { ok: false, error: 'bad stopId' };
  }
  return { ok: true, image: body.image, thumb: body.thumb || body.image, stopId: body.stopId || '' };
}

export function validatePhotoLink(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'bad body' };
  if (typeof body.id !== 'string' || !body.id || body.id.length > MAX_ID) return { ok: false, error: 'bad id' };
  if (typeof body.stopId !== 'string' || body.stopId.length > MAX_STOPID) return { ok: false, error: 'bad stopId' };
  return { ok: true, id: body.id, stopId: body.stopId };
}

export function validatePhotoId(id) {
  return typeof id === 'string' && id.length > 0 && id.length <= MAX_ID;
}
