# FailSim 💥

**API Failure Simulator for Developers**

FailSim is a powerful developer tool that intercepts HTTP requests and simulates real-world API failures like timeouts, 500 errors, slow responses, rate limits, and malformed JSON — with zero config changes to your existing code.

[![npm version](https://img.shields.io/npm/v/failsim.svg)](https://www.npmjs.com/package/failsim)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎯 **Zero Configuration** - Works with existing fetch, axios, and Express code
- 🔧 **Multiple Adapters** - Support for fetch, axios, and Express middleware
- 🎲 **Probabilistic Failures** - Configure failure rates (e.g., 30% chance)
- ⏱️ **Delay Simulation** - Add network latency to requests
- 📊 **Built-in Dashboard** - Visual interface to manage rules and view logs
- 🎨 **Preset Scenarios** - One-line presets for common failure patterns
- 🌐 **Pattern Matching** - Wildcard and regex URL matching
- 📈 **Request Logging** - Track all intercepted requests
- 🔄 **Method Filtering** - Target specific HTTP methods
- 🎭 **Multiple Failure Types** - 500, 503, 404, 429, timeout, slow, malformed, and more

## 📦 Installation

```bash
npm install failsim
# or
yarn add failsim
# or
pnpm add failsim
```

## 🚀 Quick Start

### Fetch API (Browser/Node.js)

```typescript
import { FailSim } from 'failsim';

// Initialize with rules
FailSim.init({
  rules: [
    { match: '/api/users', failure: '500', chance: 30 },
    { match: '/api/posts', failure: 'slow', delay: 2000 },
  ],
});

// Your existing fetch code works as-is
const response = await fetch('/api/users');
```

### Using Presets

```typescript
import { failsim } from 'failsim';

// One-line preset activation
failsim('flaky'); // 30% random failures
failsim('slow-3g'); // 2s delay on all requests
failsim('server-down'); // 503 on all requests
```

### Express Middleware

```typescript
import express from 'express';
import { failSimMiddleware } from 'failsim/express';

const app = express();

app.use(
  failSimMiddleware({
    rules: [
      { match: '/api/**', failure: '500', chance: 20 },
      { match: '/api/slow', failure: 'slow', delay: 3000 },
    ],
  })
);

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});
```

### Axios

```typescript
import axios from 'axios';
import { createFailSimAxios } from 'failsim/axios';

const axiosInstance = axios.create();

createFailSimAxios(axiosInstance, {
  rules: [
    { match: '/api/users', failure: '404', chance: 50 },
  ],
});

// Use axios as normal
const response = await axiosInstance.get('/api/users');
```

## 🎯 Failure Types

| Type | Description | Example |
|------|-------------|---------|
| `500` | Internal Server Error | `{ failure: '500' }` |
| `503` | Service Unavailable | `{ failure: '503' }` |
| `404` | Not Found | `{ failure: '404' }` |
| `429` | Rate Limited | `{ failure: '429' }` |
| `timeout` | Request never completes | `{ failure: 'timeout' }` |
| `slow` | Delayed response | `{ failure: 'slow', delay: 3000 }` |
| `empty` | Empty response body | `{ failure: 'empty' }` |
| `malformed` | Broken JSON | `{ failure: 'malformed' }` |
| `network-error` | Network failure | `{ failure: 'network-error' }` |

## 🎨 Presets

Quick one-line configurations for common scenarios:

```typescript
import { preset } from 'failsim';

// Available presets
preset('slow-3g')           // 2s delay on all requests
preset('server-down')       // 503 on all requests
preset('flaky')             // 30% random failures
preset('rate-limited')      // 429 after 5 requests
preset('chaos')             // Random mix of all failures
preset('offline')           // Network errors on all
preset('intermittent-timeouts') // 20% timeout chance
preset('bad-gateway')       // 502 errors
preset('malformed-responses') // Broken JSON
preset('empty-responses')   // Empty responses
```

## 🔧 Configuration

### Rule Options

```typescript
interface FailureRule {
  match: string;              // URL pattern (supports wildcards & regex)
  failure: FailureType;       // Type of failure to simulate
  chance?: number;            // Probability 0-100 (default: 100)
  delay?: number;             // Delay in ms before failure
  after?: number;             // Fail after N successful requests
  methods?: string[];         // HTTP methods to match
  statusCode?: number;        // Custom status code
  responseBody?: string;      // Custom response body
  enabled?: boolean;          // Toggle rule on/off
}
```

### URL Pattern Matching

```typescript
// Exact match
{ match: '/api/users' }

// Wildcard - single segment
{ match: '/api/*' }  // Matches /api/users, /api/posts

// Double wildcard - multiple segments
{ match: '/api/**' }  // Matches /api/users/123/posts

// Regex pattern
{ match: '/\\/api\\/users\\/\\d+/' }  // Matches /api/users/123
```

### Advanced Examples

```typescript
FailSim.init({
  rules: [
    // 50% chance of 500 error on user endpoints
    {
      match: '/api/users/**',
      failure: '500',
      chance: 50,
    },
    
    // Slow response only for POST requests
    {
      match: '/api/posts',
      failure: 'slow',
      delay: 2000,
      methods: ['POST'],
    },
    
    // Rate limit after 10 successful requests
    {
      match: '/api/limited',
      failure: '429',
      after: 10,
    },
    
    // Custom error response
    {
      match: '/api/custom',
      failure: '500',
      statusCode: 502,
      responseBody: 'Custom error message',
    },
  ],
  global: {
    enabled: true,
    logRequests: true,
    onFailure: (rule, url) => {
      console.log(`Failed: ${url} with ${rule.failure}`);
    },
  },
});
```

## 📊 Dashboard

FailSim includes a beautiful web dashboard for visual rule management:

```bash
cd packages/dashboard
npm install
npm run dev
```

The dashboard provides:
- 🎛️ Visual rule builder
- 📈 Real-time request charts
- 📝 Live request logs
- 🎨 One-click preset activation
- 📊 Failure statistics

## 🔍 API Reference

### FailSim Class

```typescript
// Initialize with config
FailSim.init(config: FailSimConfig): void

// Reset and restore original fetch
FailSim.reset(): void

// Add a rule
FailSim.addRule(rule: FailureRule): void

// Remove a rule
FailSim.removeRule(match: string): void

// Toggle a rule
FailSim.toggleRule(match: string, enabled: boolean): void

// Get request logs
FailSim.getRequestLogs(): RequestLog[]

// Clear logs
FailSim.clearLogs(): void

// Get statistics
FailSim.getStats(): {
  totalRequests: number;
  failedRequests: number;
  successfulRequests: number;
  failureRate: number;
}
```

### Express Middleware

```typescript
import { failSimMiddleware } from 'failsim/express';

app.use(failSimMiddleware(config));
```

### Axios Adapter

```typescript
import { createFailSimAxios } from 'failsim/axios';

const failsim = createFailSimAxios(axiosInstance, config);

// Update config
failsim.updateConfig(newConfig);

// Remove interceptors
failsim.reset();
```

## 🧪 Testing

Use FailSim in your test suites to verify error handling:

```typescript
import { describe, it, beforeEach, afterEach } from 'vitest';
import { FailSim } from 'failsim';

describe('API Error Handling', () => {
  beforeEach(() => {
    FailSim.init({
      rules: [{ match: '/api/users', failure: '500' }],
    });
  });

  afterEach(() => {
    FailSim.reset();
  });

  it('should handle 500 errors gracefully', async () => {
    const response = await fetch('/api/users');
    expect(response.status).toBe(500);
  });
});
```

## 🎭 Use Cases

- **Development** - Test error handling without backend changes
- **Testing** - Verify resilience and retry logic
- **Demos** - Showcase error states in presentations
- **CI/CD** - Automated reliability testing
- **Training** - Teach error handling best practices
- **Debugging** - Reproduce intermittent failures

## 📚 Examples

Check out the `/examples` directory for complete working examples:

- **React App** - Client-side failure simulation
- **Express Server** - Server-side middleware
- **Next.js** - Full-stack application

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © PPTechLabs

## 🔗 Links

- [Documentation](https://failsim.dev)
- [GitHub](https://github.com/yourusername/failsim)
- [npm](https://www.npmjs.com/package/failsim)
- [Issues](https://github.com/yourusername/failsim/issues)

## ⭐ Show Your Support

If FailSim helps you build more resilient applications, give it a ⭐️ on GitHub!

---

**Built with ❤️ for developers who care about reliability**
