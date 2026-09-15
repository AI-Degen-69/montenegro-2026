// Shared itinerary state for every visitor of the site.
//
// GET  /api/plan  -> { days, rev, updatedAt } (or { rev: 0 } before the first save)
// PUT  /api/plan  -> body { days, rev } ; stores the new plan and returns the new rev
//
// The whole plan is one small JSON blob. Writes are last-writer-wins, guarded by
// a revision counter: a client that saves against a stale rev is told to reload
// instead of silently overwriting someone else's edit.

import { put, list } from '@vercel/blob';

// random segment keeps the public blob URL from being guessable
const KEY = 'plan-9c41f7b2e6.json';
const MAX_BYTES = 4 * 1024 * 1024;

async function readPlan() {
  const { blobs } = await list({ prefix: KEY, limit: 1 });
  if (!blobs.length) return { rev: 0 };
  // the blob URL is CDN-cached; bust it so a read right after a write is fresh
  const url = blobs[0].url + (blobs[0].url.includes('?') ? '&' : '?') + 't=' + Date.now();
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return { rev: 0 };
  try {
    return await res.json();
  } catch {
    return { rev: 0 };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      return res.status(200).json(await readPlan());
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || !Array.isArray(body.days) || !body.days.length) {
        return res.status(400).json({ error: 'days missing' });
      }

      const current = await readPlan();
      const sentRev = Number(body.rev) || 0;
      if (current.rev && sentRev !== current.rev) {
        return res.status(409).json({ error: 'stale', rev: current.rev, days: current.days });
      }

      const next = {
        days: body.days,
        rev: (current.rev || 0) + 1,
        updatedAt: new Date().toISOString(),
        by: (body.by || '').toString().slice(0, 40)
      };

      const payload = JSON.stringify(next);
      if (payload.length > MAX_BYTES) {
        return res.status(413).json({ error: 'too large' });
      }

      await put(KEY, payload, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 0
      });

      return res.status(200).json({ rev: next.rev, updatedAt: next.updatedAt });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
