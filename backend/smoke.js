// Smoke test — starts the Express app on a random port (no MongoDB needed),
// runs 5 HTTP checks, then exits.
const http = require('http');
const app = require('./server');

const server = http.createServer(app);

server.listen(0, '127.0.0.1', async () => {
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  console.log(`Server running on port ${port}`);

  let passed = 0;
  let failed = 0;

  async function check(label, url, expectedStatus) {
    try {
      const res = await fetch(url);
      if (res.status === expectedStatus) {
        console.log(`✔ ${label} — expected ${expectedStatus}, got ${res.status}`);
        passed++;
      } else {
        console.log(`✘ ${label} — expected ${expectedStatus}, got ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.log(`✘ ${label} — request failed: ${err.message}`);
      failed++;
    }
  }

  await check('GET /api/habits with no token — expected 401', `${base}/api/habits`, 401);
  await check('GET /api/categories with no token — expected 401', `${base}/api/categories`, 401);
  await check('GET / serves static index.html — expected 200', `${base}/`, 200);
  await check('GET unknown route serves the React app shell (SPA catch-all) — expected 200', `${base}/some/unknown/route`, 200);
  await check('GET unknown /api route still 404s (catch-all excludes /api) — expected 404', `${base}/api/nonexistent`, 404);

  console.log(`\n${passed}/${passed + failed} smoke checks passed`);
  server.close();
  process.exit(failed > 0 ? 1 : 0);
});
