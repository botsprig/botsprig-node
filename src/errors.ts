/**
 * Base error class for all BotSprig SDK exceptions.
 */
export class BotSprigError extends Error {
  public readonly statusCode?: number;
  public readonly response?: unknown;
  public readonly code?: string;

  constructor(message: string, statusCode?: number, response?: unknown, code?: string) {
    super(message);
    this.name = 'BotSprigError';
    this.statusCode = statusCode;
    this.response = response;
    this.code = code;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Thrown when the provided API key is missing, invalid, or expired (HTTP 401).
 */
export class AuthenticationError extends BotSprigError {
  constructor(message = 'Invalid or missing BotSprig API Key.', statusCode = 401, response?: unknown) {
    super(message, statusCode, response, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Thrown when access is forbidden or bot is inactive (HTTP 403).
 */
export class PermissionDeniedError extends BotSprigError {
  constructor(message = 'Action forbidden or bot is not active.', statusCode = 403, response?: unknown) {
    super(message, statusCode, response, 'PERMISSION_DENIED');
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Thrown when subscription execution quotas have been exhausted (HTTP 403).
 */
export class QuotaExceededError extends BotSprigError {
  constructor(message = 'Monthly execution quota exhausted.', statusCode = 403, response?: unknown) {
    super(message, statusCode, response, 'QUOTA_EXCEEDED');
    this.name = 'QuotaExceededError';
  }
}

/**
 * Thrown when a requested resource (bot, subscriber, flow) is not found (HTTP 404).
 */
export class NotFoundError extends BotSprigError {
  constructor(message = 'Requested resource not found.', statusCode = 404, response?: unknown) {
    super(message, statusCode, response, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Thrown when input parameters fail server-side validation (HTTP 422).
 */
export class ValidationError extends BotSprigError {
  constructor(message = 'Invalid request parameters.', statusCode = 422, response?: unknown) {
    super(message, statusCode, response, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * Thrown when rate limits are exceeded (HTTP 429).
 */
export class RateLimitError extends BotSprigError {
  public readonly retryAfter?: number;

  constructor(message = 'Rate limit exceeded.', statusCode = 429, response?: unknown, retryAfter?: number) {
    super(message, statusCode, response, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Thrown when an HTTP request exceeds the configured timeout.
 */
export class TimeoutError extends BotSprigError {
  constructor(message = 'Request timed out.', response?: unknown) {
    super(message, undefined, response, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}
