import type { HttpClient } from '../http';
import type { GetUserParams, GetUserResponse } from '../types';

export class UsersResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Looks up a bot subscriber by their Telegram chat ID, returning their profile and active session state.
   *
   * @param params Target chat ID lookup.
   * @returns User subscriber profile and conversational session variables.
   *
   * @example
   * ```ts
   * const subscriber = await bot.users.get({ chatId: 123456789 });
   * console.log(`User: ${subscriber.user.first_name}, Session vars:`, subscriber.session?.vars);
   * ```
   */
  public async get(params: GetUserParams): Promise<GetUserResponse> {
    return this.http.post<GetUserResponse>('/api/v1/users/get', {
      chat_id: params.chatId,
    });
  }
}
