import type { HttpClient } from '../http';
import type {
  ListSubmissionsParams,
  ListSubmissionsResponse,
  PaginatedResult,
  SubmissionItem,
} from '../types';

export class SubmissionsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieves paginated form and survey submissions captured by this bot.
   *
   * @param params Optional form key filter and pagination parameters.
   * @returns Paginated list of submissions.
   *
   * @example
   * ```ts
   * const result = await bot.submissions.list({ formKey: 'lead_capture_form', page: 1, perPage: 15 });
   * for (const sub of result.data) {
   *   console.log(sub.payload_json);
   * }
   * ```
   */
  public async list(params: ListSubmissionsParams = {}): Promise<PaginatedResult<SubmissionItem>> {
    const payload: Record<string, unknown> = {};

    if (params.formKey !== undefined) payload.form_key = params.formKey;
    if (params.page !== undefined) payload.page = params.page;
    if (params.perPage !== undefined) payload.per_page = params.perPage;

    const res = await this.http.post<ListSubmissionsResponse>('/api/v1/submissions/list', payload);
    return res.submissions;
  }
}
