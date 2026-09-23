// Shared photo album for every visitor of the site.
//
// GET    /api/photos        -> { photos: [{id, url, thumb, stopId, ts, origin}] }
// POST   /api/photos        -> body {image, thumb?, stopId?} stores two image
//                               blobs + one metadata blob, returns {photo}
// PUT    /api/photos        -> body {id, stopId} re-links a photo to a place
// DELETE /api/photos?id=..  -> removes the photo (metadata + image blobs)
//
// Each photo owns its blobs (photos/<id>.json|.jpg|-t.jpg), so concurrent
// uploads never clobber each other — no revision counter needed.

import { put, del, list } from '@vercel/blob';
import { validatePhotoUpload, validatePhotoLink, validatePhotoId } from './validate-photo.js';

const PREFIX = 'photos/';

const rid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

function bufOf(dataUrl) {
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

async function readJson(url) {
  try {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function cleanMeta(m) {
  if (!m || m.id == null) return null;
  return {
    id: String(m.id).slice(0, 40),
    url: typeof m.url === 'string' ? m.url : '',
    thumb: typeof m.thumb === 'string' && m.thumb ? m.thumb : (typeof m.url === 'string' ? m.url : ''),
    stopId: typeof m.stopId === 'string' ? m.stopId.slice(0, 64) : '',
    ts: Number(m.ts) || 0,
    origin: m.origin === 'stop' ? 'stop' : 'album'
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: PREFIX, limit: 500 });
      const metas = blobs.filter(b => b.pathname.endsWith('.json'));
      const photos = (await Promise.all(metas.map(b => readJson(b.url))))
        .map(cleanMeta)
        .filter(Boolean)
        .sort((a, b) => b.ts - a.ts);
      return res.status(200).json({ photos });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const v = validatePhotoUpload(body);
      if (!v.ok) return res.status(400).json({ error: v.error });
      const id = 'p' + rid();
      const imgBlob = await put(PREFIX + id + '.jpg', bufOf(v.image), {
        access: 'public', contentType: 'image/jpeg'
      });
      const thumbBlob = await put(PREFIX + id + '-t.jpg', bufOf(v.thumb), {
        access: 'public', contentType: 'image/jpeg'
      });
      const meta = {
        id, url: imgBlob.url, thumb: thumbBlob.url,
        stopId: v.stopId, ts: Date.now(), origin: v.stopId ? 'stop' : 'album'
      };
      await put(PREFIX + id + '.json', JSON.stringify(meta), {
        access: 'public', contentType: 'application/json', cacheControlMaxAge: 0
      });
      return res.status(200).json({ photo: meta });
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const v = validatePhotoLink(body);
      if (!v.ok) return res.status(400).json({ error: v.error });
      const { blobs } = await list({ prefix: PREFIX + v.id + '.json', limit: 5 });
      const hit = blobs.find(b => b.pathname === PREFIX + v.id + '.json');
      if (!hit) return res.status(404).json({ error: 'not found' });
      const meta = cleanMeta(await readJson(hit.url));
      if (!meta) return res.status(404).json({ error: 'not found' });
      meta.stopId = v.stopId;
      await put(PREFIX + v.id + '.json', JSON.stringify(meta), {
        access: 'public', contentType: 'application/json',
        allowOverwrite: true, cacheControlMaxAge: 0
      });
      return res.status(200).json({ photo: meta });
    }

    if (req.method === 'DELETE') {
      const id = (req.query && req.query.id)
        || (typeof req.body === 'string' ? null : req.body && req.body.id)
        || null;
      if (!validatePhotoId(id)) return res.status(400).json({ error: 'bad id' });
      const { blobs } = await list({ prefix: PREFIX + id, limit: 10 });
      const mine = blobs.filter(b =>
        b.pathname === PREFIX + id + '.json' ||
        b.pathname === PREFIX + id + '.jpg' ||
        b.pathname === PREFIX + id + '-t.jpg');
      if (!mine.length) return res.status(404).json({ error: 'not found' });
      await del(mine.map(b => b.url));
      return res.status(200).json({ ok: true, deleted: mine.length });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
