import { describe, it, expect } from 'vitest';
import { URLMatcher } from '../src/matcher';

describe('URLMatcher', () => {
  describe('exact matching', () => {
    it('should match exact paths', () => {
      expect(URLMatcher.matches('/api/users', '/api/users')).toBe(true);
      expect(URLMatcher.matches('/api/users', '/api/posts')).toBe(false);
    });

    it('should match paths that start with pattern', () => {
      expect(URLMatcher.matches('/api/users/123', '/api/users')).toBe(true);
      expect(URLMatcher.matches('/api/users/123/posts', '/api/users')).toBe(true);
    });
  });

  describe('wildcard matching', () => {
    it('should match single wildcard within segment', () => {
      expect(URLMatcher.matches('/api/users', '/api/*')).toBe(true);
      expect(URLMatcher.matches('/api/posts', '/api/*')).toBe(true);
      expect(URLMatcher.matches('/api/users/123', '/api/*')).toBe(false);
    });

    it('should match double wildcard across segments', () => {
      expect(URLMatcher.matches('/api/users', '/api/**')).toBe(true);
      expect(URLMatcher.matches('/api/users/123', '/api/**')).toBe(true);
      expect(URLMatcher.matches('/api/users/123/posts', '/api/**')).toBe(true);
      expect(URLMatcher.matches('/other/path', '/api/**')).toBe(false);
    });

    it('should match complex wildcard patterns', () => {
      expect(URLMatcher.matches('/api/users/123', '/api/*/123')).toBe(true);
      expect(URLMatcher.matches('/api/posts/456', '/api/*/123')).toBe(false);
      expect(URLMatcher.matches('/api/v1/users/123', '/api/**/123')).toBe(true);
    });
  });

  describe('regex matching', () => {
    it('should match regex patterns', () => {
      expect(URLMatcher.matches('/api/users/123', '/\\/api\\/users\\/\\d+/')).toBe(true);
      expect(URLMatcher.matches('/api/users/abc', '/\\/api\\/users\\/\\d+/')).toBe(false);
    });

    it('should handle invalid regex gracefully', () => {
      expect(URLMatcher.matches('/api/users', '/[invalid(regex/')).toBe(false);
    });
  });

  describe('extractPathname', () => {
    it('should extract pathname from full URL', () => {
      expect(URLMatcher.extractPathname('https://example.com/api/users')).toBe('/api/users');
      expect(URLMatcher.extractPathname('http://localhost:3000/api/posts')).toBe('/api/posts');
    });

    it('should return pathname as-is if not a full URL', () => {
      expect(URLMatcher.extractPathname('/api/users')).toBe('/api/users');
      expect(URLMatcher.extractPathname('/api/posts/123')).toBe('/api/posts/123');
    });
  });

  describe('matchesMethod', () => {
    it('should match when no methods specified', () => {
      expect(URLMatcher.matchesMethod('GET', undefined)).toBe(true);
      expect(URLMatcher.matchesMethod('POST', undefined)).toBe(true);
      expect(URLMatcher.matchesMethod('GET', [])).toBe(true);
    });

    it('should match specified methods case-insensitively', () => {
      expect(URLMatcher.matchesMethod('GET', ['GET', 'POST'])).toBe(true);
      expect(URLMatcher.matchesMethod('get', ['GET', 'POST'])).toBe(true);
      expect(URLMatcher.matchesMethod('POST', ['GET', 'POST'])).toBe(true);
      expect(URLMatcher.matchesMethod('DELETE', ['GET', 'POST'])).toBe(false);
    });
  });
});

// 
