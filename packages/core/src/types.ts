/**
 * Supported failure types for API simulation
 */
export type FailureType =
  | '500'
  | '503'
  | '404'
  | '429'
  | 'timeout'
  | 'slow'
  | 'empty'
  | 'malformed'
  | 'network-error';

/**
 * Configuration for a single failure rule
 */
export interface FailureRule {
  /** URL pattern to match (supports wildcards and regex) */
  match: string;
  /** Type of failure to simulate */
  failure: FailureType;
  /** Probability of failure (0-100), default 100 */
  chance?: number;
  /** Delay in milliseconds before applying failure */
  delay?: number;
  /** Apply failure only after N successful requests */
  after?: number;
  /** HTTP methods to match (e.g., ['GET', 'POST']) */
  methods?: string[];
  /** Custom status code for error responses */
  statusCode?: number;
  /** Custom response body */
  responseBody?: string;
  /** Whether this rule is enabled */
  enabled?: boolean;
}

/**
 * Global configuration for FailSim
 */
export interface FailSimConfig {
  /** Array of failure rules to apply */
  rules: FailureRule[];
  /** Global settings */
  global?: {
    /** Master enable/disable switch */
    enabled?: boolean;
    /** Log all intercepted requests */
    logRequests?: boolean;
    /** Callback when a failure is triggered */
    onFailure?: (rule: FailureRule, url: string) => void;
    /** Callback for every request */
    onRequest?: (url: string, failed: boolean) => void;
  };
}

/**
 * Log entry for an intercepted request
 */
export interface RequestLog {
  /** Unique identifier for this request */
  id: string;
  /** Request URL */
  url: string;
  /** HTTP method */
  method: string;
  /** Timestamp in milliseconds */
  timestamp: number;
  /** Whether the request was failed by a rule */
  failed: boolean;
  /** Type of failure applied (if any) */
  failureType?: FailureType;
  /** Request duration in milliseconds */
  duration: number;
  /** HTTP status code */
  status?: number;
}

/**
 * Internal state for tracking rule execution
 */
export interface RuleState {
  /** Number of successful requests for this rule */
  successCount: number;
  /** Last execution timestamp */
  lastExecuted?: number;
}

// 
