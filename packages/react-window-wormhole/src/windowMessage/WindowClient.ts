import { MessageChannel } from "../channel/MessageChannel.js";
import { P2PClient } from "../channel/P2PClient.js";
import { WindowChannel } from "./WindowChannel.js";

export class WindowP2PClient extends P2PClient {
  constructor(targetWindow: Window) {
    super(
      targetWindow.location.href,
      new MessageChannel(new WindowChannel(targetWindow)),
    );
  }

  getOnline = () => {
    this.postInit();
  };
}
