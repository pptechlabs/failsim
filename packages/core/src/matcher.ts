/**
 * URL pattern matcher with support for exact, wildcard, and regex patterns
 */
export class URLMatcher {
  /**
   * Check if a URL matches a pattern
   * @param url - The URL to test
   * @param pattern - The pattern to match against (supports wildcards and regex)
   * @returns True if the URL matches the pattern
   */
  static matches(url: string, pattern: string): boolean {
    // Handle regex patterns (enclosed in forward slashes)
    if (pattern.startsWith('/') && pattern.endsWith('/') && pattern.length > 2) {
      const regexPattern = pattern.slice(1, -1);
      try {
        const regex = new RegExp(regexPattern);
        return regex.test(url);
      } catch (e) {
        console.warn(`Invalid regex pattern: ${pattern}`);
        return false;
      }
    }

    // Handle wildcard patterns
    if (pattern.includes('*')) {
      return this.matchWildcard(url, pattern);
    }

    // Exact match
    return url === pattern || url.startsWith(pattern);
  }

  /**
   * Match URL against wildcard pattern
   * @param url - The URL to test
   * @param pattern - Pattern with * wildcards
   * @returns True if the URL matches the wildcard pattern
   */
  private static matchWildcard(url: string, pattern: string): boolean {
    // Convert wildcard pattern to regex
    // ** matches any number of path segments
    // * matches within a single segment
    const regexPattern = pattern
      .replace(/\*\*/g, '___DOUBLE_WILDCARD___')
      .replace(/\*/g, '[^/]*')
      .replace(/___DOUBLE_WILDCARD___/g, '.*')
      .replace(/\//g, '\\/');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  }

  /**
   * Extract the pathname from a full URL
   * @param url - Full URL or pathname
   * @returns The pathname portion
   */
  static extractPathname(url: string): string {
    try {
      // If it's a full URL, parse it
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const urlObj = new URL(url);
        return urlObj.pathname;
      }
      // Otherwise, assume it's already a pathname
      return url;
    } catch (e) {
      return url;
    }
  }

  /**
   * Check if a method matches the allowed methods
   * @param method - The HTTP method to check
   * @param allowedMethods - Array of allowed methods (undefined means all methods)
   * @returns True if the method is allowed
   */
  static matchesMethod(method: string, allowedMethods?: string[]): boolean {
    if (!allowedMethods || allowedMethods.length === 0) {
      return true;
    }
    return allowedMethods.some(
      (m) => m.toUpperCase() === method.toUpperCase()
    );
  }
}

// 
