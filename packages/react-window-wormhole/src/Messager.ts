import { Transferable } from "./model/Transferable.js";
import { isCrossOrigin } from "./utils.js";

export enum MessageFlags {
  SYNC_INIT = "SYNC_ON_INITIALIZATION",
  FUNC_CALL = "FUNCTION_CALL",
  SEND_DATA = "SEND_DATA",
}

export type Message =
  | {
      type: MessageFlags.SYNC_INIT;
    }
  | {
      type: MessageFlags.SEND_DATA;
      data: Transferable;
    }
  | {
      type: MessageFlags.FUNC_CALL;
      data: [string | number, Transferable[]];
    };

export function sendMessage(targetWindow: Window, message: Message, targetOrigin = "*") {
  try {
    if (!isCrossOrigin(targetWindow)) targetWindow.postMessage(message, targetOrigin);
  } catch (err) {
    console.error(err);
  }
}
