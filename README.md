# BotSprig Node.js SDK

Official Node.js library for the **BotSprig** BotFlow platform. Connect your web applications, e-commerce stores, backend scripts, and microservices to your automated Telegram bots with a clean, typed, and promise-based API.

[![npm version](https://img.shields.io/npm/v/botsprig.svg?style=flat-square)](https://www.npmjs.com/package/botsprig)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

---

## Highlights

* **Zero Dependencies:** Built on native `fetch` (Node.js 18+). No external network overhead or dependency vulnerability alerts.
* **100% POST Protocol:** Fully compliant with BotSprig's unified POST-only API architecture.
* **Bot-Scoped Authentication:** Powered by bot API keys (`bs_live_...`). No need to expose or remember internal numeric bot IDs.
* **Full TypeScript Support:** Complete typings, auto-completion, and inline documentation for IDEs like VS Code.
* **Universal Compatibility:** Works seamlessly across Node.js (18, 20, 22+), Next.js, Nuxt, Bun, Deno, and serverless edge runtimes.

---

## Installation

Install using your preferred package manager:

```bash
# npm
npm install botsprig

# yarn
yarn add botsprig

# pnpm
pnpm add botsprig
```

---

## Quick Start

```typescript
import { BotSprig } from 'botsprig';

// Initialize the client with your Bot API Key
const bot = new BotSprig({
  apiKey: 'bs_live_xxxxxxxxxxxxxxxxxxxxxxxx',
  baseUrl: 'https://your-botsprig-domain.com', // Optional: defaults to https://botsprig.com
});

async function main() {
  // 1. Get bot statistics and status
  const me = await bot.getMe();
  console.log(`Connected to bot: @${me.bot_username} (${me.subscribers_count} subscribers)`);

  // 2. Broadcast an urgent alert to all designated bot admins
  const alertResult = await bot.admins.notify({
    message: '🔔 <b>New Order Placed!</b>\nOrder #1042 was completed by John Doe.',
    parseMode: 'HTML',
    replyMarkup: {
      inline_keyboard: [
        [{ text: '📦 View in Dashboard', url: 'https://mysite.com/admin/orders/1042' }]
      ]
    }
  });
  console.log(`Dispatched to ${alertResult.sent_count} admins.`);

  // 3. Send a direct message to a specific user
  await bot.messages.send({
    chatId: 123456789,
    message: 'Thank you for your purchase! Your invoice is ready.',
  });
}

main().catch(console.error);
```

### CommonJS (require) Support

If your project uses CommonJS:

```javascript
const { BotSprig } = require('botsprig');

const bot = new BotSprig('bs_live_xxxxxxxxxxxxxxxxxxxxxxxx');
// or: const bot = new BotSprig({ apiKey: '...' });
```

---

## API Reference

### Configuration Options

```typescript
const bot = new BotSprig({
  apiKey: string;           // Required: Your Bot API Key (bs_live_...)
  baseUrl?: string;          // Optional: Defaults to 'https://botsprig.com'
  timeout?: number;          // Optional: Request timeout in ms (default: 30000)
  headers?: Record<string, string>; // Optional: Custom headers merged into requests
});
```

---

### Bot Profile & Health

#### `bot.getMe()`
Retrieves status, username, subscriber count, admin count, and active flow metrics.

```typescript
const profile = await bot.getMe();
console.log(profile);
/*
{
  id: "NhAtnhr",
  title: "Customer Support Bot",
  platform: "telegram",
  bot_username: "my_support_bot",
  status: "active",
  subscribers_count: 340,
  admins_count: 3,
  active_flows_count: 8,
  created_at: "2026-10-15 12:00:00",
  verified_at: "2026-10-15 12:05:00"
}
*/
```

---

### Administrators (`bot.admins`)

#### `bot.admins.list()`
Fetches all bot subscribers designated as bot administrators.

```typescript
const admins = await bot.admins.list();
for (const admin of admins) {
  console.log(`Admin: ${admin.first_name} (@${admin.username}) - Chat ID: ${admin.chat_id}`);
}
```

#### `bot.admins.notify(params)`
Broadcasts a message, photo, or inline keyboard to all active bot admins.

```typescript
const res = await bot.admins.notify({
  message: '⚠️ <b>System Alert:</b> Server disk usage is at 85%!',
  parseMode: 'HTML',
  photo: 'https://example.com/charts/disk.png', // Optional
  replyMarkup: {
    inline_keyboard: [
      [{ text: 'View Monitoring', url: 'https://status.mysite.com' }]
    ]
  }
});

console.log(`Sent: ${res.sent_count}, Failed: ${res.failed_count}`);
```

---

### Direct Messaging (`bot.messages`)

#### `bot.messages.send(params)`
Sends a direct text message or photo to a specific subscriber by their Telegram `chat_id`.

```typescript
await bot.messages.send({
  chatId: 987654321,
  message: 'Hello! Your password reset code is: <code>839102</code>',
  parseMode: 'HTML'
});
```

---

### Subscribers (`bot.users`)

#### `bot.users.get(params)`
Queries a subscriber by their Telegram `chat_id`, returning their profile information and active session variable bag.

```typescript
const subscriber = await bot.users.get({ chatId: 987654321 });

console.log(subscriber.user.first_name);
console.log(subscriber.session?.vars); // Variables stored in their current flow session
```

---

### Flow Automation (`bot.flows`)

#### `bot.flows.trigger(params)`
Triggers a published conversational flow for a specific user, optionally injecting custom variables or context.

```typescript
await bot.flows.trigger({
  flowId: 14,
  chatId: 987654321,
  input: {
    cart_total: 89.50,
    checkout_url: 'https://mysite.com/cart/token_123'
  }
});
```

---

### Form Submissions (`bot.submissions`)

#### `bot.submissions.list(params)`
Retrieves paginated form and survey submissions collected by interactive bot apps (e.g. Lead Capture, Feedback Survey, Quizzes).

```typescript
const submissions = await bot.submissions.list({
  formKey: 'contact_form',
  page: 1,
  perPage: 25
});

console.log(`Total submissions: ${submissions.total}`);
for (const item of submissions.data) {
  console.log(item.payload_json);
}
```

---

## Error Handling

All SDK exceptions inherit from `BotSprigError`, allowing precise error handling in production:

```typescript
import {
  BotSprig,
  AuthenticationError,
  QuotaExceededError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  BotSprigError
} from 'botsprig';

const bot = new BotSprig({ apiKey: process.env.BOTSPRIG_API_KEY! });

try {
  await bot.admins.notify({ message: 'Hello Admins!' });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid BotSprig API Key. Please verify your credentials.');
  } else if (error instanceof QuotaExceededError) {
    console.error('Monthly execution quota reached. Please upgrade your BotSprig plan.');
  } else if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited! Retry after ${error.retryAfter} seconds.`);
  } else if (error instanceof BotSprigError) {
    console.error(`API Error [HTTP ${error.statusCode}]: ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Contributing & License

Contributions, bug reports, and feature requests are welcome on GitHub:
👉 [https://github.com/botsprig/botsprig-node](https://github.com/botsprig/botsprig-node)

Released under the [MIT License](LICENSE).
Copyright © 2026 BotSprig / benkhalifedev.
