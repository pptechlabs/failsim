import type { FailureType, FailureRule } from './types';

/**
 * Utility to create a delay promise
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Failure simulator that generates appropriate responses for each failure type
 */
export class FailureSimulator {
  /**
   * Apply a failure based on the rule configuration
   * @param rule - The failure rule to apply
   * @param originalFetch - Original fetch function for 'slow' failures
   * @param input - Fetch input
   * @param init - Fetch init options
   * @returns Response or throws error based on failure type
   */
  static async applyFailure(
    rule: FailureRule,
    originalFetch?: typeof fetch,
    input?: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const { failure, delay, statusCode, responseBody } = rule;

    // Apply delay if specified
    if (delay && delay > 0) {
      await sleep(delay);
    }

    switch (failure) {
      case '500':
        return new Response(
          responseBody || 'Internal Server Error',
          {
            status: statusCode || 500,
            statusText: 'Internal Server Error',
            headers: { 'Content-Type': 'text/plain' },
          }
        );

      case '503':
        return new Response(
          responseBody || 'Service Unavailable',
          {
            status: statusCode || 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
          }
        );

      case '404':
        return new Response(
          responseBody || 'Not Found',
          {
            status: statusCode || 404,
            statusText: 'Not Found',
            headers: { 'Content-Type': 'text/plain' },
          }
        );

      case '429':
        return new Response(
          responseBody || 'Too Many Requests',
          {
            status: statusCode || 429,
            statusText: 'Too Many Requests',
            headers: {
              'Content-Type': 'text/plain',
              'Retry-After': '60',
            },
          }
        );

      case 'timeout':
        // Return a promise that never resolves (simulates timeout)
        return new Promise<Response>(() => {
          // This promise intentionally never resolves or rejects
        });

      case 'slow':
        // Apply additional delay for slow responses
        const slowDelay = delay || 3000;
        await sleep(slowDelay);
        // If we have the original fetch, proceed with the real request
        if (originalFetch && input) {
          return originalFetch(input, init);
        }
        // Otherwise return a success response
        return new Response(
          responseBody || JSON.stringify({ message: 'Slow response' }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      case 'empty':
        return new Response(
          responseBody !== undefined ? responseBody : '',
          {
            status: statusCode || 200,
            statusText: 'OK',
            headers: { 'Content-Type': 'text/plain' },
          }
        );

      case 'malformed':
        return new Response(
          responseBody || '{broken json:::}',
          {
            status: statusCode || 200,
            statusText: 'OK',
            headers: { 'Content-Type': 'application/json' },
          }
        );

      case 'network-error':
        // Simulate a network error by throwing a TypeError
        throw new TypeError('Failed to fetch');

      default:
        // Fallback to 500 error
        return new Response('Unknown failure type', {
          status: 500,
          statusText: 'Internal Server Error',
        });
    }
  }

  /**
   * Check if a failure should be applied based on chance percentage
   * @param chance - Probability (0-100), undefined means 100%
   * @returns True if failure should be applied
   */
  static shouldApplyFailure(chance?: number): boolean {
    if (chance === undefined || chance === 100) {
      return true;
    }
    if (chance <= 0) {
      return false;
    }
    return Math.random() * 100 < chance;
  }

  /**
   * Get a human-readable description of a failure type
   * @param type - The failure type
   * @returns Description string
   */
  static getFailureDescription(type: FailureType): string {
    const descriptions: Record<FailureType, string> = {
      '500': 'Internal Server Error',
      '503': 'Service Unavailable',
      '404': 'Not Found',
      '429': 'Rate Limited',
      timeout: 'Request Timeout',
      slow: 'Slow Response',
      empty: 'Empty Response',
      malformed: 'Malformed JSON',
      'network-error': 'Network Error',
    };
    return descriptions[type] || 'Unknown Failure';
  }
}

// 
