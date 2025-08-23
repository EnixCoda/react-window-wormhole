import { MessageChannel } from "wormhole/channel/MessageChannel";
import { P2PClient } from "wormhole/channel/P2PClient";
import { WindowChannel } from "./WindowChannel.js";

export class WindowP2PClient extends P2PClient {
  constructor(targetWindow: Window) {
    super(new MessageChannel(new WindowChannel(targetWindow)));
  }
}
