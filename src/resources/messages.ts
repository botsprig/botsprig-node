import type { HttpClient } from '../http';
import type { SendMessageParams, SendMessageResponse } from '../types';

export class MessagesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Sends a direct text message or photo with optional inline keyboard markup to a specific subscriber.
   *
   * @param params Target chat ID, text/photo, and optional markup.
   * @returns Telegram dispatch result.
   *
   * @example
   * ```ts
   * await bot.messages.send({
   *   chatId: '123456789',
   *   message: 'Hello! Your subscription was successfully renewed.',
   *   parseMode: 'HTML'
   * });
   * ```
   */
  public async send(params: SendMessageParams): Promise<SendMessageResponse> {
    const payload: Record<string, unknown> = {
      chat_id: params.chatId,
    };

    if (params.message !== undefined) payload.message = params.message;
    if (params.photo !== undefined) payload.photo = params.photo;
    if (params.parseMode !== undefined) payload.parse_mode = params.parseMode;
    if (params.replyMarkup !== undefined) payload.reply_markup = params.replyMarkup;

    return this.http.post<SendMessageResponse>('/api/v1/messages/send', payload);
  }
}
