import { z } from "zod3";
export const CHANNEL_CAPABILITY_KEY = "claude/channel",
  CHANNEL_PERMISSION_CAPABILITY_KEY = "claude/channel/permission",
  CHANNEL_NOTIFICATION_METHOD = "notifications/claude/channel",
  CHANNEL_PERMISSION_REQUEST_METHOD =
    "notifications/claude/channel/permission_request",
  CHANNEL_PERMISSION_RESPONSE_METHOD =
    "notifications/claude/channel/permission";
export const WECHAT_CHANNEL_INSTRUCTIONS =
    'Messages from WeChat arrive as <channel source="wechat" chat_id="..." sender="..." context_token="...">. Multiple WeChat bots may be connected simultaneously. Each bot has a unique chat_id prefix. The chat_id identifies BOTH the bot instance and the user — always use the exact chat_id from the message to reply to the correct bot and user. Reply using the WeChatReply tool. ALWAYS call it with a JSON object using explicit field names: {"chat_id":"<copy from attribute>","text":"<your message>","context_token":"<copy from attribute>"}. CRITICAL: chat_id must be ONLY the attribute value (e.g. "wechat_67c6374a_o9cq807t..."). NEVER concatenate the reply text into chat_id, and never use positional or XML-style arguments. You CAN proactively send messages to any known chat_id — you are not limited to only replying. For images/files, use the "file_path" field (absolute path); combine "text" + "file_path" for a caption. If the message contains [file: /path/to/file], Read that file to see the uploaded media. IMPORTANT: The WeChat user reads the WeChatReply output, NOT your terminal text. Do NOT send a second WeChatReply to summarize -- one reply per inbound message is enough.',
  WECOM_CHANNEL_INSTRUCTIONS =
    'Messages from WeCom (企业微信) arrive as <channel source="wecom" chat_id="..." sender="..." user="...">. Multiple WeCom bots may be connected simultaneously. Each bot has a unique chat_id prefix. The chat_id identifies BOTH the bot instance and the user — always use the exact chat_id from the message to reply to the correct bot and user. Reply using the WeComReply tool:\n  - For text: pass text (supports markdown formatting)\n  - For images: pass image_url (data:image/* or http* URL)\n  - For files: pass file_path (local) or file_url (remote)\nYou CAN proactively send messages to any known chat_id — you are not limited to only replying. IMPORTANT: The WeCom user reads the WeComReply output, NOT your terminal text. Do NOT send a second WeComReply to summarize -- one reply per inbound message is enough.';
export const ChannelNotificationSchema = z.object({
  method: z.literal(CHANNEL_NOTIFICATION_METHOD),
  params: z.object({
    content: z.string(),
    meta: z.record(z.string()).optional(),
  }),
});
export const ChannelPermissionRequestSchema = z.object({
  method: z.literal(CHANNEL_PERMISSION_REQUEST_METHOD),
  params: z.object({
    request_id: z.string(),
    tool_name: z.string(),
    description: z.string(),
    input_preview: z.string(),
  }),
});
export const ChannelPermissionResponseSchema = z.object({
  method: z.literal(CHANNEL_PERMISSION_RESPONSE_METHOD),
  params: z.object({
    request_id: z.string(),
    behavior: z.enum(["allow", "allow_always", "deny", "deny_and_exit_plan"]),
  }),
});
export function stripAtMention(eA: string): string {
  let el = eA.trim();
  if (!el.startsWith("@")) return el;
  let ec = el.lastIndexOf(" ");
  return -1 === ec ? "" : el.slice(ec + 1);
}
export function escapeXmlAttr(eA: string): string {
  return eA
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
