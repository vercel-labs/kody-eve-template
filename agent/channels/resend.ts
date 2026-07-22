import { createRedisState } from "@chat-adapter/state-redis";
import { createResendAdapter } from "@resend/chat-sdk-adapter";
import type { Message, Thread } from "chat";
import { chatSdkChannel } from "eve/channels/chat-sdk";
import { requireEnv } from "../lib/constants.js";

/**
 * Email channel built on the Chat SDK's Resend adapter: inbound mail in, agent replies out.
 *
 * @remarks
 * Thread state lives in Redis (`@chat-adapter/state-redis`, configured by `REDIS_URL`). The
 * adapter authenticates with `RESEND_API_KEY`, plus `RESEND_WEBHOOK_SECRET` for inbound
 * webhooks; both are read from env. Streaming is off because email has no incremental
 * rendering: each reply is delivered as one message. The sender address comes from
 * `RESEND_FROM_ADDRESS`, the same variable the system prompt and digest task use, so channel
 * replies and agent-sent mail share one identity. The destructured `bot` and `send` wire the
 * handlers below, which forward new mentions and follow-ups on subscribed threads into the
 * agent.
 */
export const { bot, channel, send } = chatSdkChannel({
  adapters: {
    resend: createResendAdapter({
      fromAddress: requireEnv("RESEND_FROM_ADDRESS", "kody@yourdomain.com"),
      fromName: process.env.RESEND_FROM_NAME ?? "Kody",
    }),
  },
  state: createRedisState(),
  streaming: false,
  userName: "Kody Agent",
});

bot.onNewMention(async (thread: Thread, message: Message) => {
  await thread.subscribe();
  await send(message.text, { thread });
});

bot.onSubscribedMessage(async (thread: Thread, message: Message) => {
  await send(message.text, { thread });
});

export default channel;
