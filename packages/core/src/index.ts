/**
 * FailSim - API Failure Simulator for Developers
 * 
 * A developer tool that intercepts HTTP requests and simulates real-world API failures
 * like timeouts, 500 errors, slow responses, rate limits, and malformed JSON.
 * 
 * @packageDocumentation
 */

// Core exports
export { FailSimEngine, getGlobalEngine, resetGlobalEngine } from './engine';
export { URLMatcher } from './matcher';
export { FailureSimulator } from './failures';
export { FailSimPresets, preset } from './presets';

// Type exports
export type {
  FailureType,
  FailureRule,
  FailSimConfig,
  RequestLog,
  RuleState,
} from './types';

// Fetch adapter (default export)
export { FailSim, patchFetch, unpatchFetch, isFetchPatched } from './adapters/fetch';

// Re-export FailSim as default for convenience
export { FailSim as default } from './adapters/fetch';

/**
 * Quick start function to initialize FailSim with a simple configuration
 * @param rules - Array of failure rules or preset name
 * @returns The global engine instance
 * 
 * @example
 * ```typescript
 * import { failsim } from 'failsim';
 * 
 * // Using preset
 * failsim('flaky');
 * 
 * // Using custom rules
 * failsim([
 *   { match: '/api/users', failure: '500', chance: 30 }
 * ]);
 * ```
 */
export function failsim(rules: any): any {
  const { FailSim } = require('./adapters/fetch');
  const { preset } = require('./presets');
  
  if (typeof rules === 'string') {
    // It's a preset name
    const presetRules = preset(rules);
    FailSim.init({ rules: presetRules });
  } else if (Array.isArray(rules)) {
    // It's an array of rules
    FailSim.init({ rules });
  } else {
    // It's a full config object
    FailSim.init(rules);
  }
  
  return FailSim;
}

// 
