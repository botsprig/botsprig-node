/**
 * Configuration options for the BotSprig client.
 */
export interface BotSprigOptions {
  /**
   * The dedicated API key for your BotSprig bot (e.g. `bs_live_...`).
   */
  apiKey: string;

  /**
   * Base URL of your BotSprig platform or custom self-hosted domain.
   * Default: `https://botsprig.com`
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * Default: 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Custom HTTP headers merged into every outbound API request.
   */
  headers?: Record<string, string>;

  /**
   * Optional custom fetch implementation (useful for testing or specific runtimes).
   */
  fetch?: typeof globalThis.fetch;
}

export type ParseMode = 'HTML' | 'Markdown' | 'MarkdownV2';

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: { url: string };
  login_url?: { url: string; forward_text?: string };
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

/**
 * Public bot profile and metric statistics.
 */
export interface BotProfile {
  id: string;
  title: string;
  platform: 'telegram' | string;
  bot_username: string | null;
  status: 'active' | 'paused' | 'draft' | 'error';
  created_at: string;
  verified_at: string | null;
  subscribers_count: number;
  admins_count: number;
  active_flows_count: number;
}

export interface GetMeResponse {
  ok: boolean;
  bot: BotProfile;
}

/**
 * Administrator representation for a BotSprig bot.
 */
export interface BotAdmin {
  id: number;
  chat_id: string | number;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  language_code: string | null;
  is_blocked: boolean;
  first_seen_at: string;
  last_seen_at: string;
}

export interface ListAdminsResponse {
  ok: boolean;
  admins: BotAdmin[];
}

export interface NotifyAdminsParams {
  /** Text content of the notification message. Required if `photo` is not provided. */
  message?: string;
  /** Direct URL or Telegram file_id of a photo to send. */
  photo?: string;
  /** Text formatting mode. Default: 'HTML' */
  parseMode?: ParseMode;
  /** Inline buttons or full Telegram reply_markup structure. */
  replyMarkup?: InlineKeyboardMarkup | InlineKeyboardButton[][] | Record<string, unknown>;
}

export interface AdminNotificationDetail {
  chat_id: string | number;
  ok: boolean;
  error?: string;
}

export interface NotifyAdminsResponse {
  ok: boolean;
  sent_count: number;
  failed_count: number;
  total_admins: number;
  details?: AdminNotificationDetail[];
  message?: string;
}

export interface SendMessageParams {
  /** Target subscriber Telegram chat ID. */
  chatId: string | number;
  /** Message text content. Required if `photo` is not provided. */
  message?: string;
  /** Photo URL or Telegram file_id. */
  photo?: string;
  /** Text parse mode ('HTML', 'Markdown', etc.). Default: 'HTML' */
  parseMode?: ParseMode;
  /** Inline keyboard or Telegram reply markup. */
  replyMarkup?: InlineKeyboardMarkup | InlineKeyboardButton[][] | Record<string, unknown>;
}

export interface SendMessageResponse {
  ok: boolean;
  result?: Record<string, unknown>;
  error?: string;
}

export interface GetUserParams {
  /** Subscriber Telegram chat ID. */
  chatId: string | number;
}

export interface BotSubscriber {
  id: number;
  chat_id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  language_code: string | null;
  is_admin: boolean;
  is_blocked: boolean;
  first_seen_at: string;
  last_seen_at: string;
  vars: Record<string, unknown>;
}

export interface UserSession {
  flow_id: number;
  step_count: number;
  vars: Record<string, unknown>;
  updated_at: string;
}

export interface GetUserResponse {
  ok: boolean;
  user: BotSubscriber;
  session: UserSession | null;
}

export interface TriggerFlowParams {
  /** Target flow ID (numeric ID or public identifier). */
  flowId: number | string;
  /** Target subscriber Telegram chat ID. */
  chatId: string | number;
  /** Optional custom session variables or context payload passed to the triggered flow. */
  input?: Record<string, unknown>;
}

export interface TriggerFlowResponse {
  ok: boolean;
  message: string;
  flow_id: number;
  chat_id: string | number;
}

export interface ListSubmissionsParams {
  /** Filter submissions by specific form identifier (e.g. 'contact_form'). */
  formKey?: string;
  /** Page number for pagination. Default: 1 */
  page?: number;
  /** Number of submissions per page (max: 100). Default: 20 */
  perPage?: number;
}

export interface SubmissionItem {
  id: number;
  bot_id: number;
  flow_id: number | null;
  bot_user_id: number;
  form_key: string;
  payload_json: Record<string, unknown>;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResult<T> {
  current_page: number;
  data: T[];
  first_page_url?: string;
  from?: number;
  last_page: number;
  last_page_url?: string;
  next_page_url?: string | null;
  path?: string;
  per_page: number;
  prev_page_url?: string | null;
  to?: number;
  total: number;
}

export interface ListSubmissionsResponse {
  ok: boolean;
  submissions: PaginatedResult<SubmissionItem>;
}
