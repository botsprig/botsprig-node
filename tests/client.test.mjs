import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BotSprig,
  AuthenticationError,
  PermissionDeniedError,
  QuotaExceededError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  BotSprigError,
} from '../dist/esm/index.js';

test('BotSprig Initialization', async (t) => {
  await t.test('throws AuthenticationError when apiKey is missing', () => {
    assert.throws(() => new BotSprig(''), AuthenticationError);
    assert.throws(() => new BotSprig({ apiKey: '' }), AuthenticationError);
    assert.throws(() => new BotSprig(null), AuthenticationError);
  });

  await t.test('initializes cleanly with valid apiKey string', () => {
    const bot = new BotSprig('bs_live_test_123456');
    assert.ok(bot);
    assert.ok(bot.admins);
    assert.ok(bot.messages);
    assert.ok(bot.users);
    assert.ok(bot.flows);
    assert.ok(bot.submissions);
  });
});

test('HTTP Transport & 100% POST Protocol', async (t) => {
  await t.test('dispatches POST with correct headers and JSON payload', async () => {
    let capturedUrl = '';
    let capturedOptions = null;

    const mockFetch = async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      return new Response(
        JSON.stringify({
          ok: true,
          bot: { id: 'test_bot', title: 'Demo Bot', status: 'active' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const bot = new BotSprig({
      apiKey: 'bs_live_mock_secret',
      baseUrl: 'https://custom.botsprig.test',
      fetch: mockFetch,
    });

    const res = await bot.getMe();

    assert.equal(capturedUrl, 'https://custom.botsprig.test/api/v1/bot/me');
    assert.equal(capturedOptions.method, 'POST');
    assert.equal(capturedOptions.headers['Authorization'], 'Bearer bs_live_mock_secret');
    assert.equal(capturedOptions.headers['X-Bot-Key'], 'bs_live_mock_secret');
    assert.equal(capturedOptions.headers['Content-Type'], 'application/json');
    assert.equal(res.id, 'test_bot');
  });

  await t.test('maps HTTP 401 to AuthenticationError', async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify({ ok: false, message: 'Invalid API key.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });

    const bot = new BotSprig({ apiKey: 'bs_live_invalid', fetch: mockFetch });
    await assert.rejects(async () => bot.getMe(), AuthenticationError);
  });

  await t.test('maps HTTP 403 quota message to QuotaExceededError', async () => {
    const mockFetch = async () =>
      new Response(
        JSON.stringify({ ok: false, message: 'Monthly execution quota limit reached.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );

    const bot = new BotSprig({ apiKey: 'bs_live_test', fetch: mockFetch });
    await assert.rejects(async () => bot.getMe(), QuotaExceededError);
  });

  await t.test('maps HTTP 403 paused bot to PermissionDeniedError', async () => {
    const mockFetch = async () =>
      new Response(
        JSON.stringify({ ok: false, message: 'Bot status is paused.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );

    const bot = new BotSprig({ apiKey: 'bs_live_test', fetch: mockFetch });
    await assert.rejects(async () => bot.getMe(), PermissionDeniedError);
  });

  await t.test('maps HTTP 404 to NotFoundError', async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify({ ok: false, message: 'Subscriber not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });

    const bot = new BotSprig({ apiKey: 'bs_live_test', fetch: mockFetch });
    await assert.rejects(async () => bot.users.get({ chatId: 999 }), NotFoundError);
  });

  await t.test('maps HTTP 422 to ValidationError', async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify({ ok: false, message: 'chat_id is required.' }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      });

    const bot = new BotSprig({ apiKey: 'bs_live_test', fetch: mockFetch });
    await assert.rejects(async () => bot.messages.send({ chatId: '' }), ValidationError);
  });

  await t.test('maps HTTP 429 to RateLimitError', async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify({ ok: false, message: 'Too many requests.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });

    const bot = new BotSprig({ apiKey: 'bs_live_test', fetch: mockFetch });
    await assert.rejects(async () => bot.getMe(), RateLimitError);
  });
});

test('Resource Endpoints', async (t) => {
  await t.test('bot.admins.list() returns administrators', async () => {
    const mockFetch = async (url, opts) => {
      assert.equal(opts.method, 'POST');
      assert.match(url, /\/api\/v1\/admins\/list$/);
      return new Response(
        JSON.stringify({
          ok: true,
          admins: [
            { id: 1, chat_id: '123456', first_name: 'Super', username: 'admin' },
          ],
        }),
        { status: 200 }
      );
    };

    const bot = new BotSprig({ apiKey: 'bs_live_test', fetch: mockFetch });
    const admins = await bot.admins.list();
    assert.equal(admins.length, 1);
    assert.equal(admins[0].username, 'admin');
  });

  await t.test('bot.admins.notify() sends notification payload', async () => {
    let sentBody = '';
    const mockFetch = async (url, opts) => {
      sentBody = JSON.parse(opts.body);
      return new Response(
        JSON.stringify({
          ok: true,
          sent_count: 2,
          failed_count: 0,
          total_admins: 2,
        }),
        { status: 200 }
      );
    };

    const bot = new BotSprig({ apiKey: 'bs_live_test', fetch: mockFetch });
    const res = await bot.admins.notify({
      message: 'New Order!',
      parseMode: 'HTML',
      replyMarkup: { inline_keyboard: [[{ text: 'Go', url: 'https://test.com' }]] },
    });

    assert.equal(sentBody.message, 'New Order!');
    assert.equal(sentBody.parse_mode, 'HTML');
    assert.ok(sentBody.reply_markup);
    assert.equal(res.sent_count, 2);
  });

  await t.test('bot.flows.trigger() dispatches flow and payload', async () => {
    let sentBody = '';
    const mockFetch = async (url, opts) => {
      sentBody = JSON.parse(opts.body);
      return new Response(
        JSON.stringify({
          ok: true,
          message: 'Flow triggered successfully.',
          flow_id: 42,
          chat_id: '998877',
        }),
        { status: 200 }
      );
    };

    const bot = new BotSprig({ apiKey: 'bs_live_test', fetch: mockFetch });
    const res = await bot.flows.trigger({
      flowId: 42,
      chatId: '998877',
      input: { orderId: 1042 },
    });

    assert.equal(sentBody.flow_id, 42);
    assert.equal(sentBody.chat_id, '998877');
    assert.equal(sentBody.variables.orderId, 1042);
    assert.equal(res.flow_id, 42);
  });

  await t.test('bot.submissions.list() parses paginated submissions', async () => {
    let sentBody = '';
    const mockFetch = async (url, opts) => {
      sentBody = JSON.parse(opts.body);
      return new Response(
        JSON.stringify({
          ok: true,
          submissions: {
            current_page: 1,
            data: [{ id: 1, form_key: 'contact_form', payload_json: { email: 'user@test.com' } }],
            total: 1,
            per_page: 10,
            last_page: 1,
          },
        }),
        { status: 200 }
      );
    };

    const bot = new BotSprig({ apiKey: 'bs_live_test', fetch: mockFetch });
    const subs = await bot.submissions.list({ formKey: 'contact_form', page: 1, perPage: 10 });

    assert.equal(sentBody.form_key, 'contact_form');
    assert.equal(sentBody.page, 1);
    assert.equal(subs.total, 1);
    assert.equal(subs.data[0].form_key, 'contact_form');
  });
});
