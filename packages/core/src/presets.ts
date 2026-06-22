import type { FailureRule } from './types';

/**
 * Preset configurations for common failure scenarios
 */
export class FailSimPresets {
  /**
   * Simulate slow 3G network - adds 2000ms delay to all requests
   * @returns Array of failure rules
   */
  static slow3g(): FailureRule[] {
    return [
      {
        match: '/**',
        failure: 'slow',
        delay: 2000,
        chance: 100,
      },
    ];
  }

  /**
   * Simulate complete server downtime - returns 503 for all requests
   * @returns Array of failure rules
   */
  static serverDown(): FailureRule[] {
    return [
      {
        match: '/**',
        failure: '503',
        chance: 100,
      },
    ];
  }

  /**
   * Simulate flaky network - 30% random failure on all requests
   * @returns Array of failure rules
   */
  static flaky(): FailureRule[] {
    return [
      {
        match: '/**',
        failure: '500',
        chance: 30,
      },
    ];
  }

  /**
   * Simulate rate limiting - 429 error after every 5 requests
   * @returns Array of failure rules
   */
  static rateLimited(): FailureRule[] {
    return [
      {
        match: '/**',
        failure: '429',
        after: 5,
        chance: 100,
      },
    ];
  }

  /**
   * Simulate chaos - random mix of all failure types
   * @returns Array of failure rules
   */
  static chaos(): FailureRule[] {
    return [
      {
        match: '/**',
        failure: '500',
        chance: 15,
      },
      {
        match: '/**',
        failure: '503',
        chance: 10,
      },
      {
        match: '/**',
        failure: '429',
        chance: 10,
      },
      {
        match: '/**',
        failure: 'timeout',
        chance: 5,
      },
      {
        match: '/**',
        failure: 'slow',
        delay: 3000,
        chance: 20,
      },
      {
        match: '/**',
        failure: 'malformed',
        chance: 10,
      },
      {
        match: '/**',
        failure: 'network-error',
        chance: 5,
      },
    ];
  }

  /**
   * Simulate complete offline mode - network errors on all requests
   * @returns Array of failure rules
   */
  static offline(): FailureRule[] {
    return [
      {
        match: '/**',
        failure: 'network-error',
        chance: 100,
      },
    ];
  }

  /**
   * Simulate intermittent timeouts - 20% chance of timeout
   * @returns Array of failure rules
   */
  static intermittentTimeouts(): FailureRule[] {
    return [
      {
        match: '/**',
        failure: 'timeout',
        chance: 20,
      },
    ];
  }

  /**
   * Simulate bad gateway - 502 errors
   * @returns Array of failure rules
   */
  static badGateway(): FailureRule[] {
    return [
      {
        match: '/**',
        failure: '503',
        statusCode: 502,
        responseBody: 'Bad Gateway',
        chance: 100,
      },
    ];
  }

  /**
   * Simulate malformed responses - broken JSON
   * @returns Array of failure rules
   */
  static malformedResponses(): FailureRule[] {
    return [
      {
        match: '/**',
        failure: 'malformed',
        chance: 100,
      },
    ];
  }

  /**
   * Simulate empty responses
   * @returns Array of failure rules
   */
  static emptyResponses(): FailureRule[] {
    return [
      {
        match: '/**',
        failure: 'empty',
        chance: 100,
      },
    ];
  }

  /**
   * Get all available presets
   * @returns Object mapping preset names to their functions
   */
  static getAllPresets(): Record<string, () => FailureRule[]> {
    return {
      'slow-3g': this.slow3g,
      'server-down': this.serverDown,
      flaky: this.flaky,
      'rate-limited': this.rateLimited,
      chaos: this.chaos,
      offline: this.offline,
      'intermittent-timeouts': this.intermittentTimeouts,
      'bad-gateway': this.badGateway,
      'malformed-responses': this.malformedResponses,
      'empty-responses': this.emptyResponses,
    };
  }

  /**
   * Apply a preset by name
   * @param name - Name of the preset
   * @returns Array of failure rules or null if preset not found
   */
  static getPreset(name: string): FailureRule[] | null {
    const presets = this.getAllPresets();
    const preset = presets[name];
    return preset ? preset() : null;
  }
}

/**
 * Convenience function to get a preset by name
 * @param name - Name of the preset
 * @returns Array of failure rules
 */
export function preset(name: string): FailureRule[] {
  const rules = FailSimPresets.getPreset(name);
  if (!rules) {
    throw new Error(`Unknown preset: ${name}`);
  }
  return rules;
}

// 
