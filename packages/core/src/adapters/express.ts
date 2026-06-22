import type { Request, Response, NextFunction } from 'express';
import type { FailSimConfig } from '../types';
import { FailSimEngine } from '../engine';
import { FailureSimulator } from '../failures';

/**
 * Create Express middleware for FailSim
 * @param config - FailSim configuration
 * @returns Express middleware function
 */
export function failSimMiddleware(config: FailSimConfig) {
  const engine = new FailSimEngine(config);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    const url = req.originalUrl || req.url;
    const method = req.method;

    // Find matching rule
    const rule = engine.findMatchingRule(url, method);

    if (rule) {
      try {
        // Apply delay if specified
        if (rule.delay && rule.delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, rule.delay));
        }

        const duration = Date.now() - startTime;

        // Handle different failure types
        switch (rule.failure) {
          case '500':
            engine.logRequest(url, method, true, rule, duration, 500);
            res.status(rule.statusCode || 500).send(rule.responseBody || 'Internal Server Error');
            return;

          case '503':
            engine.logRequest(url, method, true, rule, duration, 503);
            res.status(rule.statusCode || 503).send(rule.responseBody || 'Service Unavailable');
            return;

          case '404':
            engine.logRequest(url, method, true, rule, duration, 404);
            res.status(rule.statusCode || 404).send(rule.responseBody || 'Not Found');
            return;

          case '429':
            engine.logRequest(url, method, true, rule, duration, 429);
            res
              .status(rule.statusCode || 429)
              .set('Retry-After', '60')
              .send(rule.responseBody || 'Too Many Requests');
            return;

          case 'timeout':
            // Don't respond - let the request hang
            engine.logRequest(url, method, true, rule, duration);
            // Request will timeout on client side
            return;

          case 'slow':
            // Already applied delay above, continue to next middleware
            const slowDelay = rule.delay || 3000;
            await new Promise((resolve) => setTimeout(resolve, slowDelay));
            engine.logRequest(url, method, false, rule, Date.now() - startTime);
            next();
            return;

          case 'empty':
            engine.logRequest(url, method, true, rule, duration, 200);
            res.status(rule.statusCode || 200).send(rule.responseBody !== undefined ? rule.responseBody : '');
            return;

          case 'malformed':
            engine.logRequest(url, method, true, rule, duration, 200);
            res
              .status(rule.statusCode || 200)
              .set('Content-Type', 'application/json')
              .send(rule.responseBody || '{broken json:::}');
            return;

          case 'network-error':
            // Destroy the connection
            engine.logRequest(url, method, true, rule, duration);
            req.socket.destroy();
            return;

          default:
            // Unknown failure type, pass through
            next();
            return;
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        engine.logRequest(url, method, true, rule, duration);
        next(error);
        return;
      }
    }

    // No rule matched, log and continue
    const originalSend = res.send.bind(res);
    res.send = function (body: any): Response {
      const duration = Date.now() - startTime;
      engine.logRequest(url, method, false, undefined, duration, res.statusCode);
      return originalSend(body);
    };

    next();
  };
}

/**
 * FailSim class for Express
 */
export class ExpressFailSim {
  private engine: FailSimEngine;

  constructor(config: FailSimConfig) {
    this.engine = new FailSimEngine(config);
  }

  /**
   * Get the middleware function
   * @returns Express middleware
   */
  middleware() {
    return failSimMiddleware(this.engine.getConfig());
  }

  /**
   * Get the engine instance
   * @returns FailSim engine
   */
  getEngine(): FailSimEngine {
    return this.engine;
  }

  /**
   * Update configuration
   * @param config - New configuration
   */
  updateConfig(config: FailSimConfig): void {
    this.engine.init(config);
  }
}

/**
 * Create an Express FailSim instance
 * @param config - FailSim configuration
 * @returns ExpressFailSim instance
 */
export function createExpressFailSim(config: FailSimConfig): ExpressFailSim {
  return new ExpressFailSim(config);
}

// 
