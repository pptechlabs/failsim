import express from 'express';
import { failSimMiddleware } from 'failsim/express';

const app = express();
const PORT = 3000;

// Apply FailSim middleware with configuration
app.use(
  failSimMiddleware({
    rules: [
      // 50% chance of 500 error on /api/users
      { match: '/api/users', failure: '500', chance: 50 },
      // 2 second delay on /api/posts
      { match: '/api/posts', failure: 'slow', delay: 2000 },
      // 429 rate limit after 3 requests to /api/limited
      { match: '/api/limited', failure: '429', after: 3 },
    ],
    global: {
      enabled: true,
      logRequests: true,
    },
  })
);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'FailSim Express Example',
    endpoints: [
      'GET /api/users - 50% chance of 500 error',
      'GET /api/posts - 2s delay',
      'GET /api/limited - 429 after 3 requests',
      'GET /api/normal - No failures',
    ],
  });
});

app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ],
  });
});

app.get('/api/posts', (req, res) => {
  res.json({
    posts: [
      { id: 1, title: 'First Post' },
      { id: 2, title: 'Second Post' },
    ],
  });
});

app.get('/api/limited', (req, res) => {
  res.json({
    message: 'This endpoint is rate limited',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/normal', (req, res) => {
  res.json({
    message: 'This endpoint has no failures configured',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   FailSim Express Example Server     ║
╚═══════════════════════════════════════╝

Server running at: http://localhost:${PORT}

Try these endpoints:
  • GET http://localhost:${PORT}/api/users
  • GET http://localhost:${PORT}/api/posts
  • GET http://localhost:${PORT}/api/limited
  • GET http://localhost:${PORT}/api/normal

Configured failures:
  ✗ /api/users - 50% chance of 500 error
  ⏱  /api/posts - 2 second delay
  🚫 /api/limited - 429 after 3 requests
  `);
});

// 
