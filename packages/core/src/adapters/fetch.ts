import type { FailSimConfig } from '../types';
import { getGlobalEngine } from '../engine';
import { FailureSimulator } from '../failures';

// Store original fetch
let originalFetch: typeof fetch | null = null;
let isPatched = false;

/**
 * Patch the global fetch function to intercept requests
 * @param config - Optional FailSim configuration
 */
export function patchFetch(config?: FailSimConfig): void {
  // Avoid double-patching
  if (isPatched) {
    return;
  }

  // Store original fetch
  if (typeof globalThis.fetch === 'function') {
    originalFetch = globalThis.fetch.bind(globalThis);
  } else {
    throw new Error('fetch is not available in this environment');
  }

  const engine = getGlobalEngine();
  if (config) {
    engine.init(config);
  }

  // Create patched fetch
  const patchedFetch: typeof fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const startTime = Date.now();
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method || 'GET';

    // Find matching rule
    const rule = engine.findMatchingRule(url, method);

    if (rule) {
      // Apply failure
      try {
        const response = await FailureSimulator.applyFailure(
          rule,
          originalFetch!,
          input,
          init
        );
        const duration = Date.now() - startTime;
        engine.logRequest(url, method, true, rule, duration, response.status);
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        engine.logRequest(url, method, true, rule, duration);
        throw error;
      }
    }

    // No rule matched, proceed with original fetch
    try {
      const response = await originalFetch!(input, init);
      const duration = Date.now() - startTime;
      engine.logRequest(url, method, false, undefined, duration, response.status);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      engine.logRequest(url, method, false, undefined, duration);
      throw error;
    }
  };

  // Replace global fetch
  globalThis.fetch = patchedFetch;
  isPatched = true;
}

/**
 * Restore the original fetch function
 */
export function unpatchFetch(): void {
  if (originalFetch && isPatched) {
    globalThis.fetch = originalFetch;
    originalFetch = null;
    isPatched = false;
  }
}

/**
 * Check if fetch is currently patched
 * @returns True if fetch is patched
 */
export function isFetchPatched(): boolean {
  return isPatched;
}

/**
 * Main FailSim class for fetch adapter
 */
export class FailSim {
  /**
   * Initialize FailSim with configuration
   * @param config - FailSim configuration
   */
  static init(config: FailSimConfig): void {
    patchFetch(config);
  }

  /**
   * Reset FailSim and restore original fetch
   */
  static reset(): void {
    unpatchFetch();
    getGlobalEngine().reset();
  }

  /**
   * Get the global engine instance
   * @returns The global engine
   */
  static getEngine() {
    return getGlobalEngine();
  }

  /**
   * Add a rule to the engine
   */
  static addRule = getGlobalEngine().addRule.bind(getGlobalEngine());

  /**
   * Remove a rule from the engine
   */
  static removeRule = getGlobalEngine().removeRule.bind(getGlobalEngine());

  /**
   * Toggle a rule
   */
  static toggleRule = getGlobalEngine().toggleRule.bind(getGlobalEngine());

  /**
   * Get request logs
   */
  static getRequestLogs = getGlobalEngine().getRequestLogs.bind(getGlobalEngine());

  /**
   * Clear request logs
   */
  static clearLogs = getGlobalEngine().clearLogs.bind(getGlobalEngine());

  /**
   * Get statistics
   */
  static getStats = getGlobalEngine().getStats.bind(getGlobalEngine());
}

// 
