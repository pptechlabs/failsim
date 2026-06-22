import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { FailSimConfig } from '../types';
import { FailSimEngine } from '../engine';
import { FailureSimulator } from '../failures';

/**
 * Create FailSim interceptors for an Axios instance
 * @param axiosInstance - The Axios instance to patch
 * @param config - FailSim configuration
 * @returns Object with eject functions to remove interceptors
 */
export function createAxiosInterceptors(
  axiosInstance: AxiosInstance,
  config: FailSimConfig
): { ejectRequest: () => void; ejectResponse: () => void } {
  const engine = new FailSimEngine(config);

  // Request interceptor
  const requestInterceptorId = axiosInstance.interceptors.request.use(
    async (axiosConfig: InternalAxiosRequestConfig) => {
      const startTime = Date.now();
      const url = axiosConfig.url || '';
      const method = axiosConfig.method?.toUpperCase() || 'GET';

      // Store start time for duration calculation
      (axiosConfig as any).__failsimStartTime = startTime;

      // Find matching rule
      const rule = engine.findMatchingRule(url, method);

      if (rule) {
        // For certain failure types, we need to reject the request immediately
        if (
          rule.failure === '500' ||
          rule.failure === '503' ||
          rule.failure === '404' ||
          rule.failure === '429' ||
          rule.failure === 'network-error' ||
          rule.failure === 'timeout' ||
          rule.failure === 'empty' ||
          rule.failure === 'malformed'
        ) {
          // Apply delay if specified
          if (rule.delay && rule.delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, rule.delay));
          }

          // Create a simulated response
          const response = await FailureSimulator.applyFailure(rule);
          const duration = Date.now() - startTime;

          // Log the failed request
          engine.logRequest(url, method, true, rule, duration, response.status);

          // For network errors, throw immediately
          if (rule.failure === 'network-error') {
            throw new Error('Network Error');
          }

          // For timeout, create a promise that never resolves
          if (rule.failure === 'timeout') {
            await new Promise(() => {}); // Never resolves
          }

          // Convert Response to Axios error
          const error: any = new Error(`Request failed with status ${response.status}`);
          const headers: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          error.response = {
            status: response.status,
            statusText: response.statusText,
            data: await response.text(),
            headers: headers,
            config: axiosConfig,
          };
          error.config = axiosConfig;
          error.isAxiosError = true;

          throw error;
        }

        // For 'slow' failure, just add delay and continue
        if (rule.failure === 'slow') {
          const delay = rule.delay || 3000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      return axiosConfig;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging successful requests
  const responseInterceptorId = axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      const startTime = (response.config as any).__failsimStartTime || Date.now();
      const duration = Date.now() - startTime;
      const url = response.config.url || '';
      const method = response.config.method?.toUpperCase() || 'GET';

      engine.logRequest(url, method, false, undefined, duration, response.status);

      return response;
    },
    (error) => {
      // Log failed requests that weren't caused by FailSim
      if (error.config) {
        const startTime = (error.config as any).__failsimStartTime || Date.now();
        const duration = Date.now() - startTime;
        const url = error.config.url || '';
        const method = error.config.method?.toUpperCase() || 'GET';
        const status = error.response?.status;

        engine.logRequest(url, method, true, undefined, duration, status);
      }

      return Promise.reject(error);
    }
  );

  return {
    ejectRequest: () => axiosInstance.interceptors.request.eject(requestInterceptorId),
    ejectResponse: () => axiosInstance.interceptors.response.eject(responseInterceptorId),
  };
}

/**
 * FailSim adapter for Axios
 */
export class AxiosFailSim {
  private axiosInstance: AxiosInstance;
  private ejectFunctions: { ejectRequest: () => void; ejectResponse: () => void } | null = null;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  /**
   * Initialize FailSim for this Axios instance
   * @param config - FailSim configuration
   */
  init(config: FailSimConfig): void {
    // Remove existing interceptors if any
    this.reset();

    // Add new interceptors
    this.ejectFunctions = createAxiosInterceptors(this.axiosInstance, config);
  }

  /**
   * Remove FailSim interceptors
   */
  reset(): void {
    if (this.ejectFunctions) {
      this.ejectFunctions.ejectRequest();
      this.ejectFunctions.ejectResponse();
      this.ejectFunctions = null;
    }
  }
}

/**
 * Create a FailSim-enabled Axios instance
 * @param axiosInstance - The Axios instance to wrap
 * @param config - FailSim configuration
 * @returns AxiosFailSim instance
 */
export function createFailSimAxios(
  axiosInstance: AxiosInstance,
  config: FailSimConfig
): AxiosFailSim {
  const failsim = new AxiosFailSim(axiosInstance);
  failsim.init(config);
  return failsim;
}

// 
