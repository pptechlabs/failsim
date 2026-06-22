import type { FailSimConfig, FailureRule, RequestLog, RuleState } from './types';
import { URLMatcher } from './matcher';
import { FailureSimulator } from './failures';

/**
 * Core engine for managing failure simulation rules and request interception
 */
export class FailSimEngine {
  private config: FailSimConfig;
  private requestLogs: RequestLog[] = [];
  private ruleStates: Map<string, RuleState> = new Map();
  private logIdCounter = 0;

  constructor(config?: FailSimConfig) {
    this.config = config || { rules: [] };
    this.initializeRuleStates();
  }

  /**
   * Initialize the engine with a configuration
   * @param config - FailSim configuration
   */
  init(config: FailSimConfig): void {
    this.config = config;
    this.initializeRuleStates();
  }

  /**
   * Reset the engine to default state
   */
  reset(): void {
    this.config = { rules: [] };
    this.requestLogs = [];
    this.ruleStates.clear();
    this.logIdCounter = 0;
  }

  /**
   * Add a new failure rule
   * @param rule - The failure rule to add
   */
  addRule(rule: FailureRule): void {
    this.config.rules.push(rule);
    this.initializeRuleState(rule.match);
  }

  /**
   * Remove a rule by its match pattern
   * @param match - The match pattern of the rule to remove
   */
  removeRule(match: string): void {
    this.config.rules = this.config.rules.filter((r) => r.match !== match);
    this.ruleStates.delete(match);
  }

  /**
   * Toggle a rule on or off
   * @param match - The match pattern of the rule to toggle
   * @param enabled - Whether the rule should be enabled
   */
  toggleRule(match: string, enabled: boolean): void {
    const rule = this.config.rules.find((r) => r.match === match);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * Get all request logs
   * @returns Array of request logs
   */
  getRequestLogs(): RequestLog[] {
    return [...this.requestLogs];
  }

  /**
   * Clear all request logs
   */
  clearLogs(): void {
    this.requestLogs = [];
  }

  /**
   * Get the current configuration
   * @returns Current FailSim configuration
   */
  getConfig(): FailSimConfig {
    return { ...this.config };
  }

  /**
   * Get all active rules
   * @returns Array of enabled rules
   */
  getActiveRules(): FailureRule[] {
    return this.config.rules.filter((r) => r.enabled !== false);
  }

  /**
   * Find a matching rule for a given URL and method
   * @param url - The request URL
   * @param method - The HTTP method
   * @returns Matching rule or null
   */
  findMatchingRule(url: string, method: string): FailureRule | null {
    // Check if globally disabled
    if (this.config.global?.enabled === false) {
      return null;
    }

    const pathname = URLMatcher.extractPathname(url);

    for (const rule of this.config.rules) {
      // Skip disabled rules
      if (rule.enabled === false) {
        continue;
      }

      // Check URL match
      if (!URLMatcher.matches(pathname, rule.match)) {
        continue;
      }

      // Check method match
      if (!URLMatcher.matchesMethod(method, rule.methods)) {
        continue;
      }

      // Check 'after' condition
      if (rule.after !== undefined) {
        const state = this.ruleStates.get(rule.match);
        if (state && state.successCount < rule.after) {
          // Increment success count and skip this rule
          state.successCount++;
          continue;
        }
      }

      // Check chance percentage
      if (!FailureSimulator.shouldApplyFailure(rule.chance)) {
        continue;
      }

      return rule;
    }

    return null;
  }

  /**
   * Log a request
   * @param url - Request URL
   * @param method - HTTP method
   * @param failed - Whether the request failed
   * @param rule - The rule that was applied (if any)
   * @param duration - Request duration in ms
   * @param status - HTTP status code
   */
  logRequest(
    url: string,
    method: string,
    failed: boolean,
    rule?: FailureRule,
    duration?: number,
    status?: number
  ): void {
    if (this.config.global?.logRequests === false) {
      return;
    }

    const log: RequestLog = {
      id: `req-${++this.logIdCounter}`,
      url,
      method,
      timestamp: Date.now(),
      failed,
      failureType: rule?.failure,
      duration: duration || 0,
      status,
    };

    this.requestLogs.push(log);

    // Keep only last 1000 logs to prevent memory issues
    if (this.requestLogs.length > 1000) {
      this.requestLogs.shift();
    }

    // Trigger callbacks
    if (failed && rule && this.config.global?.onFailure) {
      this.config.global.onFailure(rule, url);
    }

    if (this.config.global?.onRequest) {
      this.config.global.onRequest(url, failed);
    }
  }

  /**
   * Initialize rule states for tracking
   */
  private initializeRuleStates(): void {
    this.ruleStates.clear();
    for (const rule of this.config.rules) {
      this.initializeRuleState(rule.match);
    }
  }

  /**
   * Initialize state for a single rule
   * @param match - The rule's match pattern
   */
  private initializeRuleState(match: string): void {
    if (!this.ruleStates.has(match)) {
      this.ruleStates.set(match, {
        successCount: 0,
      });
    }
  }

  /**
   * Get statistics about failures
   * @returns Object with failure statistics
   */
  getStats(): {
    totalRequests: number;
    failedRequests: number;
    successfulRequests: number;
    failureRate: number;
  } {
    const total = this.requestLogs.length;
    const failed = this.requestLogs.filter((log) => log.failed).length;
    const successful = total - failed;

    return {
      totalRequests: total,
      failedRequests: failed,
      successfulRequests: successful,
      failureRate: total > 0 ? (failed / total) * 100 : 0,
    };
  }
}

// Global singleton instance
let globalEngine: FailSimEngine | null = null;

/**
 * Get or create the global FailSim engine instance
 * @returns The global engine instance
 */
export function getGlobalEngine(): FailSimEngine {
  if (!globalEngine) {
    globalEngine = new FailSimEngine();
  }
  return globalEngine;
}

/**
 * Reset the global engine instance
 */
export function resetGlobalEngine(): void {
  if (globalEngine) {
    globalEngine.reset();
  }
  globalEngine = null;
}

// 
