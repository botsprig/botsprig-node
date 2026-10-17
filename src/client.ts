import { HttpClient } from './http';
import { AdminsResource } from './resources/admins';
import { FlowsResource } from './resources/flows';
import { MessagesResource } from './resources/messages';
import { SubmissionsResource } from './resources/submissions';
import { UsersResource } from './resources/users';
import type {
  BotProfile,
  BotSprigOptions,
  GetMeResponse,
  NotifyAdminsParams,
  NotifyAdminsResponse,
  SendMessageParams,
  SendMessageResponse,
} from './types';

/**
 * Main BotSprig client for interacting with the BotFlow platform API.
 *
 * @example
 * ```ts
 * import { BotSprig } from 'botsprig';
 *
 * const bot = new BotSprig({
 *   apiKey: 'bs_live_xxxxxxxxxxxxxxxxxxxxxxxx',
 *   baseUrl: 'https://botsprig.com' // Optional
 * });
 *
 * // Send a notification to all bot administrators
 * await bot.admins.notify({
 *   message: '🔔 New lead submitted form on website!'
 * });
 * ```
 */
export class BotSprig {
  private readonly http: HttpClient;

  public readonly admins: AdminsResource;
  public readonly messages: MessagesResource;
  public readonly users: UsersResource;
  public readonly flows: FlowsResource;
  public readonly submissions: SubmissionsResource;

  /**
   * Initializes a new BotSprig client instance.
   *
   * @param optionsOrApiKey Either a configuration options object or an API key string directly.
   */
  constructor(optionsOrApiKey: BotSprigOptions | string) {
    const options: BotSprigOptions =
      typeof optionsOrApiKey === 'string'
        ? { apiKey: optionsOrApiKey }
        : optionsOrApiKey;

    this.http = new HttpClient(options);

    this.admins = new AdminsResource(this.http);
    this.messages = new MessagesResource(this.http);
    this.users = new UsersResource(this.http);
    this.flows = new FlowsResource(this.http);
    this.submissions = new SubmissionsResource(this.http);
  }

  /**
   * Retrieves profile, status, subscriber counts, and flow statistics for this bot.
   *
   * @returns Detailed bot profile information.
   *
   * @example
   * ```ts
   * const me = await bot.getMe();
   * console.log(`Connected to: @${me.bot_username} (${me.title})`);
   * ```
   */
  public async getMe(): Promise<BotProfile> {
    const res = await this.http.post<GetMeResponse>('/api/v1/bot/me');
    return res.bot;
  }

  /**
   * Convenience shorthand for `bot.admins.notify(...)`.
   */
  public async notifyAdmins(params: NotifyAdminsParams): Promise<NotifyAdminsResponse> {
    return this.admins.notify(params);
  }

  /**
   * Convenience shorthand for `bot.messages.send(...)`.
   */
  public async sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    return this.messages.send(params);
  }
}
