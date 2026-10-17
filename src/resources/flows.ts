import type { HttpClient } from '../http';
import type { TriggerFlowParams, TriggerFlowResponse } from '../types';

export class FlowsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Programmatically triggers a published automated flow for a specific user.
   *
   * @param params Target flow ID, subscriber chat ID, and optional input variables payload.
   * @returns Trigger confirmation.
   *
   * @example
   * ```ts
   * await bot.flows.trigger({
   *   flowId: 5,
   *   chatId: '123456789',
   *   input: {
   *     product_name: 'Premium Plan',
   *     discount_code: 'SPRING2026'
   *   }
   * });
   * ```
   */
  public async trigger(params: TriggerFlowParams): Promise<TriggerFlowResponse> {
    const payload: Record<string, unknown> = {
      flow_id: params.flowId,
      chat_id: params.chatId,
    };

    if (params.input !== undefined) {
      payload.variables = params.input;
    }

    return this.http.post<TriggerFlowResponse>('/api/v1/flows/trigger', payload);
  }
}
