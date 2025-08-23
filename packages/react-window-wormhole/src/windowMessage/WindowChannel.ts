import { Channel } from "wormhole/channel/Channel";
import { EventHub } from "wormhole/utils/EventHub";
import { isCrossOrigin } from "../utils/isCrossOrigin.js";

export class WindowChannel implements Channel {
  constructor(private targetWindow: Window) {
    if (isCrossOrigin(targetWindow))
      throw new Error("Cross-origin communication is not allowed");
    this.init();
  }

  private messageEventListener = (e: MessageEvent) => {
    if (
      e.source === this.targetWindow &&
      this.targetWindow.origin === window.origin
    ) {
      return this.messageHub.dispatch(e.data);
    }
  };

  init() {
    window.addEventListener("message", this.messageEventListener);
  }

  close() {
    window.removeEventListener("message", this.messageEventListener);
  }

  messageHub = new EventHub<MessageEvent["data"]>();
  onMessage(handler: (payload: unknown) => void): void {
    this.messageHub.addListener(handler);
  }

  postMessage(payload: unknown): void {
    this.targetWindow.postMessage(payload, window.origin);
  }
}
