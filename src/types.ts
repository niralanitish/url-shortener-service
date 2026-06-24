/**
 * Type declarations representing a shortened URL mapping.
 */
export interface UrlMapping {
  shortKey: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
}

/**
 * Type declarations for API request payloads.
 */
export interface UrlRequest {
  originalUrl: string;
}
