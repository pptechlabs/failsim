import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { patchFetch, unpatchFetch, FailSim } from '../src/adapters/fetch';
import type { FailSimConfig } from '../src/types';

describe('Fetch Adapter', () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    // Mock fetch
    globalThis.fetch = vi.fn(async () => {
      return new Response('OK', { status: 200 });
    }) as any;
  });

  afterEach(() => {
    unpatchFetch();
    globalThis.fetch = originalFetch;
  });

  describe('patchFetch', () => {
    it('should patch global fetch', () => {
      const config: FailSimConfig = {
        rules: [{ match: '/api/users', failure: '500' }],
      };

      patchFetch(config);
      expect(globalThis.fetch).not.toBe(originalFetch);
    });

    it('should not double-patch', () => {
      patchFetch();
      const patchedFetch = globalThis.fetch;
      patchFetch();
      expect(globalThis.fetch).toBe(patchedFetch);
    });
  });

  describe('unpatchFetch', () => {
    it('should restore original fetch', () => {
      patchFetch();
      const patchedFetch = globalThis.fetch;
      
      unpatchFetch();
      // After unpatch, fetch should be different from patched version
      expect(globalThis.fetch).not.toBe(patchedFetch);
      // And should be a function
      expect(typeof globalThis.fetch).toBe('function');
    });
  });

  describe('request interception', () => {
    it('should intercept and fail matching requests', async () => {
      const config: FailSimConfig = {
        rules: [{ match: '/api/users', failure: '500' }],
      };

      patchFetch(config);

      const response = await fetch('/api/users');
      expect(response.status).toBe(500);
      expect(await response.text()).toBe('Internal Server Error');
    });

    it('should pass through non-matching requests', async () => {
      const config: FailSimConfig = {
        rules: [{ match: '/api/users', failure: '500' }],
      };

      patchFetch(config);

      const response = await fetch('/api/posts');
      expect(response.status).toBe(200);
      expect(await response.text()).toBe('OK');
    });

    it('should handle 404 failures', async () => {
      const config: FailSimConfig = {
        rules: [{ match: '/api/users', failure: '404' }],
      };

      patchFetch(config);

      const response = await fetch('/api/users');
      expect(response.status).toBe(404);
      expect(await response.text()).toBe('Not Found');
    });

    it('should handle network errors', async () => {
      const config: FailSimConfig = {
        rules: [{ match: '/api/users', failure: 'network-error' }],
      };

      patchFetch(config);

      await expect(fetch('/api/users')).rejects.toThrow('Failed to fetch');
    });

    it('should handle malformed responses', async () => {
      const config: FailSimConfig = {
        rules: [{ match: '/api/users', failure: 'malformed' }],
      };

      patchFetch(config);

      const response = await fetch('/api/users');
      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('{broken json:::}');
    });

    it('should handle empty responses', async () => {
      const config: FailSimConfig = {
        rules: [{ match: '/api/users', failure: 'empty' }],
      };

      patchFetch(config);

      const response = await fetch('/api/users');
      expect(response.status).toBe(200);
      expect(await response.text()).toBe('');
    });

    it('should respect method filters', async () => {
      const config: FailSimConfig = {
        rules: [{ match: '/api/users', failure: '500', methods: ['POST'] }],
      };

      patchFetch(config);

      // GET should pass through
      const getResponse = await fetch('/api/users', { method: 'GET' });
      expect(getResponse.status).toBe(200);

      // POST should fail
      const postResponse = await fetch('/api/users', { method: 'POST' });
      expect(postResponse.status).toBe(500);
    });

    it('should apply custom status codes', async () => {
      const config: FailSimConfig = {
        rules: [{ match: '/api/users', failure: '500', statusCode: 502 }],
      };

      patchFetch(config);

      const response = await fetch('/api/users');
      expect(response.status).toBe(502);
    });

    it('should apply custom response bodies', async () => {
      const config: FailSimConfig = {
        rules: [
          {
            match: '/api/users',
            failure: '500',
            responseBody: 'Custom error message',
          },
        ],
      };

      patchFetch(config);

      const response = await fetch('/api/users');
      expect(await response.text()).toBe('Custom error message');
    });
  });

  describe('FailSim class', () => {
    it('should initialize and reset', () => {
      const config: FailSimConfig = {
        rules: [{ match: '/api/users', failure: '500' }],
      };

      FailSim.init(config);
      expect(FailSim.getEngine().getConfig().rules).toHaveLength(1);

      FailSim.reset();
      expect(FailSim.getEngine().getConfig().rules).toHaveLength(0);
    });

    it('should add and remove rules', () => {
      FailSim.init({ rules: [] });

      FailSim.addRule({ match: '/api/users', failure: '500' });
      expect(FailSim.getEngine().getConfig().rules).toHaveLength(1);

      FailSim.removeRule('/api/users');
      expect(FailSim.getEngine().getConfig().rules).toHaveLength(0);
    });

    it('should get request logs', async () => {
      const config: FailSimConfig = {
        rules: [{ match: '/api/users', failure: '500' }],
      };

      FailSim.init(config);
      await fetch('/api/users');

      const logs = FailSim.getRequestLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].url).toBe('/api/users');
      expect(logs[0].failed).toBe(true);
    });

    it('should get statistics', async () => {
      const config: FailSimConfig = {
        rules: [{ match: '/api/users', failure: '500' }],
      };

      // Clear any previous logs
      FailSim.init(config);
      FailSim.clearLogs();
      
      await fetch('/api/users');
      await fetch('/api/posts');

      const stats = FailSim.getStats();
      expect(stats.totalRequests).toBe(2);
      expect(stats.failedRequests).toBe(1);
      expect(stats.successfulRequests).toBe(1);
    });
  });
});

// 
