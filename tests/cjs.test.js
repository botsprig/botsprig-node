const test = require('node:test');
const assert = require('node:assert/strict');
const { BotSprig, AuthenticationError } = require('../dist/cjs/index.js');

test('CommonJS Compatibility', async (t) => {
  await t.test('can require BotSprig and instantiate client', () => {
    assert.throws(() => new BotSprig(''), AuthenticationError);
    const bot = new BotSprig('bs_live_cjs_token');
    assert.ok(bot);
    assert.ok(bot.admins);
    assert.ok(bot.messages);
    assert.ok(bot.flows);
    assert.ok(bot.users);
    assert.ok(bot.submissions);
  });
});
