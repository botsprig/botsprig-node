import {
  AuthenticationError,
  BotSprigError,
  NotFoundError,
  PermissionDeniedError,
  QuotaExceededError,
  RateLimitError,
  TimeoutError,
  ValidationError,
} from './errors';
import type { BotSprigOptions } from './types';

const SDK_VERSION = '1.0.0';
const DEFAULT_BASE_URL = 'https://botsprig.com';
const DEFAULT_TIMEOUT_MS = 30000;

export class HttpClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly customHeaders: Record<string, string>;
  private readonly fetchFn: typeof globalThis.fetch;

  constructor(options: BotSprigOptions) {
    if (!options || !options.apiKey || typeof options.apiKey !== 'string') {
      throw new AuthenticationError('A valid BotSprig Bot API key (e.g. "bs_live_...") is required.');
    }

    this.apiKey = options.apiKey.trim();
    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
    this.customHeaders = options.headers ?? {};
    this.fetchFn = options.fetch ?? globalThis.fetch;

    if (typeof this.fetchFn !== 'function') {
      throw new BotSprigError(
        'Native fetch is not available. Please ensure you are running on Node.js 18+ or provide a custom fetch implementation.'
      );
    }
  }

  /**
   * Executes an HTTP POST request to the BotSprig API.
   * All BotSprig API endpoints strictly enforce 100% POST protocol with JSON body.
   */
  public async post<T>(path: string, payload: Record<string, unknown> = {}): Promise<T> {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.baseUrl}${cleanPath}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Bot-Key': this.apiKey,
      'User-Agent': `botsprig-node/${SDK_VERSION} (Node.js ${process.version || 'unknown'})`,
      ...this.customHeaders,
    };

    let response: Response;
    try {
      response = await this.fetchFn(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('aborted'))) {
        throw new TimeoutError(`Request to ${cleanPath} exceeded timeout of ${this.timeout}ms.`);
      }

      throw new BotSprigError(`Network connection to BotSprig failed: ${(err as Error).message}`);
    } finally {
      clearTimeout(timeoutId);
    }

    let data: Record<string, unknown> | null = null;
    const rawText = await response.text();

    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        // Response was not JSON
        data = null;
      }
    }

    if (!response.ok || (data && data.ok === false)) {
      this.handleError(response.status, data, rawText);
    }

    return (data as T) ?? ({} as T);
  }

  private handleError(statusCode: number, data: Record<string, unknown> | null, rawText: string): never {
    const message =
      (typeof data?.message === 'string' && data.message) ||
      (typeof data?.error === 'string' && data.error) ||
      rawText ||
      `HTTP Error ${statusCode}`;

    const lowerMsg = message.toLowerCase();

    if (statusCode === 401) {
      throw new AuthenticationError(message, statusCode, data);
    }

    if (statusCode === 403) {
      if (lowerMsg.includes('quota') || lowerMsg.includes('limit') || lowerMsg.includes('upgrade')) {
        throw new QuotaExceededError(message, statusCode, data);
      }
      throw new PermissionDeniedError(message, statusCode, data);
    }

    if (statusCode === 404) {
      throw new NotFoundError(message, statusCode, data);
    }

    if (statusCode === 422) {
      throw new ValidationError(message, statusCode, data);
    }

    if (statusCode === 429) {
      throw new RateLimitError(message, statusCode, data);
    }

    throw new BotSprigError(message, statusCode, data);
  }
}
