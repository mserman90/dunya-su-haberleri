import test from 'node:test';
import assert from 'node:assert';
import app from '../server.js';

let server;
const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('GET /api/news returns 200 and an array of news items', async () => {
  const res = await fetch(`${BASE_URL}/api/news`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data), 'Response should be an array');
  assert.ok(data.length > 0, 'Array should not be empty');
  assert.ok(data[0].id, 'Item must have an id');
  assert.ok(data[0].title, 'Item must have a title');
});

test('POST /api/news rejects invalid input with 400', async () => {
  const res = await fetch(`${BASE_URL}/api/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '', // Boş başlık
      lat: 200,   // Geçersiz enlem
      lng: 50
    })
  });
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.error, 'Should return error message');
});

test('POST /api/news accepts valid input and persists it', async () => {
  const payload = {
    title: 'Otomatik Test Baraj Haberi',
    description: 'Test açıklaması',
    country: 'Türkiye',
    lat: 38.0,
    lng: 35.0,
    region: 'arab',
    category: 'dam',
    url: 'https://www.unwater.org/',
    emoji: '🏗️',
    color: '#3b82f6'
  };

  const res = await fetch(`${BASE_URL}/api/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.title, payload.title);
  assert.strictEqual(data.category, 'dam');
});

test('GET /api/cron-weekly checks CRON_SECRET if configured', async () => {
  // Test header rejection when secret is set
  process.env.CRON_SECRET = 'supersecret';
  const unauthorizedRes = await fetch(`${BASE_URL}/api/cron-weekly`);
  assert.strictEqual(unauthorizedRes.status, 401);

  const authorizedRes = await fetch(`${BASE_URL}/api/cron-weekly`, {
    headers: { 'Authorization': 'Bearer supersecret' }
  });
  assert.strictEqual(authorizedRes.status, 200);
  delete process.env.CRON_SECRET;
});

test('GET /api/news supports ?category and ?region query filters', async () => {
  const res = await fetch(`${BASE_URL}/api/news?category=dam`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.ok(data.every(item => item.category === 'dam'), 'All items should belong to dam category');
});

test('GET /api/sync-rss endpoint returns a valid response', async () => {
  const res = await fetch(`${BASE_URL}/api/sync-rss`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.status, 'Response should contain status');
});

test('POST /api/ai/insights returns AI analysis without API key', async () => {
  const res = await fetch(`${BASE_URL}/api/ai/insights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Aral Gölü Kurtarma Projesi',
      country: 'Kazakistan',
      description: 'Baraj inşası ile su hacmi yükseliyor.'
    })
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.analysis, 'Response should contain analysis');
});

test('POST /api/ai/ask answers water questions without API key', async () => {
  const res = await fetch(`${BASE_URL}/api/ai/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Dünyadaki su krizinin ana nedenleri nelerdir?'
    })
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.answer, 'Response should contain an answer');
});
