import { WechatClientConstants as value } from "./channel-client-constants.js";
export const {
  CREDENTIALS_DIR,
  CREDENTIALS_FILENAME,
  DEFAULT_API_BASE_URL,
  DEFAULT_DEDUP_WINDOW_SIZE,
  DEFAULT_ILINK_BOT_TYPE,
  DEFAULT_MAX_RECONNECT_DELAY_MS,
  DEFAULT_POLL_TIMEOUT_MS,
  ERRCODE_SESSION_TIMEOUT,
  QR_LONG_POLL_TIMEOUT_MS,
  TYPING_STATUS_CANCEL,
  TYPING_STATUS_START,
  WechatMessageItemType,
} = value;
export type WechatMessageItemType = 1 | 2 | 3 | 4 | 5;
