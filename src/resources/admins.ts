import type { HttpClient } from '../http';
import type {
  BotAdmin,
  ListAdminsResponse,
  NotifyAdminsParams,
  NotifyAdminsResponse,
} from '../types';

export class AdminsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieves the list of administrators configured for this bot.
   *
   * @returns Array of administrator subscriber objects.
   *
   * @example
   * ```ts
   * const admins = await bot.admins.list();
   * console.log(`Found ${admins.length} bot admins`);
   * ```
   */
  public async list(): Promise<BotAdmin[]> {
    const res = await this.http.post<ListAdminsResponse>('/api/v1/admins/list');
    return res.admins || [];
  }

  /**
   * Broadcasts a notification text message or photo to all active administrators of this bot.
   *
   * @param params Notification parameters (message, photo, parseMode, replyMarkup)
   * @returns Summary of dispatched messages and status.
   *
   * @example
   * ```ts
   * const result = await bot.admins.notify({
   *   message: '🔔 <b>Alert:</b> New order received on website!',
   *   parseMode: 'HTML',
   *   replyMarkup: {
   *     inline_keyboard: [[{ text: 'View Order', url: 'https://mysite.com/orders/102' }]]
   *   }
   * });
   * console.log(`Notified ${result.sent_count} admins.`);
   * ```
   */
  public async notify(params: NotifyAdminsParams): Promise<NotifyAdminsResponse> {
    const payload: Record<string, unknown> = {};

    if (params.message !== undefined) payload.message = params.message;
    if (params.photo !== undefined) payload.photo = params.photo;
    if (params.parseMode !== undefined) payload.parse_mode = params.parseMode;
    if (params.replyMarkup !== undefined) payload.reply_markup = params.replyMarkup;

    return this.http.post<NotifyAdminsResponse>('/api/v1/admins/notify', payload);
  }
}
