import { isCrossOrigin } from "../utils.js";
import { Channel } from "./Channel.js";

export function createWindowChannel(
  targetWindow: Window,
  targetOrigin = "*",
): Channel {
  if (isCrossOrigin(targetWindow))
    throw new Error("Cross-origin communication is not allowed");

  let _messageHandler: (message: MessageEvent["data"]) => void;
  const messageEventListener = (e: MessageEvent) => {
    if (e.source === targetWindow) {
      return _messageHandler?.(e.data);
    }
  };
  const listen = () => window.addEventListener("message", messageEventListener);
  listen();

  const close = () =>
    window.removeEventListener("message", messageEventListener);

  return {
    onMessage: (messageHandler) => {
      _messageHandler = messageHandler;
    },
    postMessage: (message) => targetWindow.postMessage(message, targetOrigin),
    close,
  };
}
