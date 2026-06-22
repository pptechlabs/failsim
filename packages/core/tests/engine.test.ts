import { describe, it, expect, beforeEach } from 'vitest';
import { FailSimEngine } from '../src/engine';
import type { FailSimConfig } from '../src/types';

describe('FailSimEngine', () => {
  let engine: FailSimEngine;

  beforeEach(() => {
    engine = new FailSimEngine();
  });

  describe('initialization', () => {
    it('should initialize with empty config', () => {
      expect(engine.getConfig()).toEqual({ rules: [] });
    });

    it('should initialize with provided config', () => {
      const config: FailSimConfig = {
        rules: [
          { match: '/api/users', failure: '500' },
        ],
      };
      engine.init(config);
      expect(engine.getConfig()).toEqual(config);
    });
  });

  describe('rule management', () => {
    it('should add a rule', () => {
      engine.addRule({ match: '/api/users', failure: '500' });
      expect(engine.getConfig().rules).toHaveLength(1);
      expect(engine.getConfig().rules[0].match).toBe('/api/users');
    });

    it('should remove a rule', () => {
      engine.addRule({ match: '/api/users', failure: '500' });
      engine.addRule({ match: '/api/posts', failure: '404' });
      expect(engine.getConfig().rules).toHaveLength(2);

      engine.removeRule('/api/users');
      expect(engine.getConfig().rules).toHaveLength(1);
      expect(engine.getConfig().rules[0].match).toBe('/api/posts');
    });

    it('should toggle a rule', () => {
      engine.addRule({ match: '/api/users', failure: '500', enabled: true });
      engine.toggleRule('/api/users', false);
      expect(engine.getConfig().rules[0].enabled).toBe(false);

      engine.toggleRule('/api/users', true);
      expect(engine.getConfig().rules[0].enabled).toBe(true);
    });

    it('should get active rules only', () => {
      engine.addRule({ match: '/api/users', failure: '500', enabled: true });
      engine.addRule({ match: '/api/posts', failure: '404', enabled: false });
      engine.addRule({ match: '/api/comments', failure: '503' });

      const activeRules = engine.getActiveRules();
      expect(activeRules).toHaveLength(2);
      expect(activeRules.map(r => r.match)).toEqual(['/api/users', '/api/comments']);
    });
  });

  describe('rule matching', () => {
    beforeEach(() => {
      engine.init({
        rules: [
          { match: '/api/users', failure: '500', methods: ['GET'] },
          { match: '/api/posts', failure: '404' },
          { match: '/api/**', failure: '503', enabled: false },
        ],
      });
    });

    it('should find matching rule by URL', () => {
      const rule = engine.findMatchingRule('/api/users', 'GET');
      expect(rule).not.toBeNull();
      expect(rule?.failure).toBe('500');
    });

    it('should respect method filters', () => {
      const getRule = engine.findMatchingRule('/api/users', 'GET');
      expect(getRule?.failure).toBe('500');

      const postRule = engine.findMatchingRule('/api/users', 'POST');
      expect(postRule).toBeNull();
    });

    it('should skip disabled rules', () => {
      const rule = engine.findMatchingRule('/api/comments', 'GET');
      expect(rule).toBeNull();
    });

    it('should return null when globally disabled', () => {
      engine.init({
        rules: [{ match: '/api/users', failure: '500' }],
        global: { enabled: false },
      });

      const rule = engine.findMatchingRule('/api/users', 'GET');
      expect(rule).toBeNull();
    });

    it('should respect chance percentage', () => {
      engine.init({
        rules: [{ match: '/api/users', failure: '500', chance: 0 }],
      });

      const rule = engine.findMatchingRule('/api/users', 'GET');
      expect(rule).toBeNull();
    });

    it('should respect after N requests', () => {
      engine.init({
        rules: [{ match: '/api/users', failure: '500', after: 2 }],
      });

      // First two requests should not match
      expect(engine.findMatchingRule('/api/users', 'GET')).toBeNull();
      expect(engine.findMatchingRule('/api/users', 'GET')).toBeNull();

      // Third request should match
      const rule = engine.findMatchingRule('/api/users', 'GET');
      expect(rule).not.toBeNull();
      expect(rule?.failure).toBe('500');
    });
  });

  describe('request logging', () => {
    it('should log requests', () => {
      engine.logRequest('/api/users', 'GET', false, undefined, 100, 200);
      const logs = engine.getRequestLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].url).toBe('/api/users');
      expect(logs[0].method).toBe('GET');
      expect(logs[0].failed).toBe(false);
      expect(logs[0].duration).toBe(100);
      expect(logs[0].status).toBe(200);
    });

    it('should clear logs', () => {
      engine.logRequest('/api/users', 'GET', false);
      expect(engine.getRequestLogs()).toHaveLength(1);

      engine.clearLogs();
      expect(engine.getRequestLogs()).toHaveLength(0);
    });

    it('should limit log size to 1000 entries', () => {
      for (let i = 0; i < 1100; i++) {
        engine.logRequest(`/api/request-${i}`, 'GET', false);
      }

      expect(engine.getRequestLogs()).toHaveLength(1000);
    });

    it('should not log when disabled', () => {
      engine.init({
        rules: [],
        global: { logRequests: false },
      });

      engine.logRequest('/api/users', 'GET', false);
      expect(engine.getRequestLogs()).toHaveLength(0);
    });
  });

  describe('statistics', () => {
    it('should calculate failure statistics', () => {
      engine.logRequest('/api/users', 'GET', false);
      engine.logRequest('/api/posts', 'GET', true);
      engine.logRequest('/api/comments', 'GET', true);

      const stats = engine.getStats();
      expect(stats.totalRequests).toBe(3);
      expect(stats.failedRequests).toBe(2);
      expect(stats.successfulRequests).toBe(1);
      expect(stats.failureRate).toBeCloseTo(66.67, 1);
    });

    it('should handle zero requests', () => {
      const stats = engine.getStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.failureRate).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset engine to default state', () => {
      engine.addRule({ match: '/api/users', failure: '500' });
      engine.logRequest('/api/users', 'GET', false);

      engine.reset();

      expect(engine.getConfig().rules).toHaveLength(0);
      expect(engine.getRequestLogs()).toHaveLength(0);
    });
  });
});

// 
