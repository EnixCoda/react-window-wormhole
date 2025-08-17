import { EventHub } from "../utils/EventHub.js";
import { MessageChannel } from "./MessageChannel.js";
import { Peer } from "./Peer.js";
import {
  AckMessage,
  DataMessage,
  FuncCallMessage,
  FuncReturnMessage,
  InitMessage,
  Message,
  QuitMessage,
} from "./TransferableMessage.js";

export class P2PClient {
  peers = new Map<string, Peer>();

  // hubs for AppMessage
  dataHub = new EventHub<DataMessage>();
  funcCallHub = new EventHub<FuncCallMessage>();
  funcReturnHub = new EventHub<FuncReturnMessage>();

  constructor(
    readonly id: string,
    private channel: MessageChannel,
  ) {
    this.#listenToChannel();
  }

  #listenToChannel() {
    const channel = this.channel;
    channel.onInit((message) => {
      this.#peerJoin(message);
      this.#postAck({ to: message.from });
    });
    channel.onQuit(this.#peerLeave);
    const filterToClientMessage = createMessageFilter({ to: this.id });
    channel.onAck(filterToClientMessage(this.#peerJoin));
    channel.onDataMessage(filterToClientMessage(this.dataHub.dispatch));
    channel.onFuncCall(filterToClientMessage(this.funcCallHub.dispatch));
    channel.onFuncReturn(filterToClientMessage(this.funcReturnHub.dispatch));
  }

  #postAck({ to }: Pick<AckMessage, "to">) {
    this.channel.postAck({ from: this.id, to });
  }

  postInit() {
    this.channel.postInit({ from: this.id });
  }

  #addHub = new EventHub<Peer>();
  onPeerJoin = (handler: (peer: Peer) => void) =>
    this.#addHub.addListener(handler);

  #leaveHub = new EventHub<Peer>();
  onPeerLeave = (handler: (peer: Peer) => void) =>
    this.#leaveHub.addListener(handler);

  #peerJoin = ({ from }: InitMessage | AckMessage): void => {
    if (from === this.id) {
      console.warn(`Cannot add self as a peer.`);
      return;
    }

    if (this.peers.has(from)) {
      console.warn(`Peer with id ${from} already exists.`);
      return;
    }

    const peer = new Peer(from, this.id, this.channel);

    const filterDirectMessage = createMessageFilter({
      to: this.id,
      from,
    });
    this.channel.onDataMessage(filterDirectMessage(peer.dataHub.dispatch));
    this.channel.onFuncCall(filterDirectMessage(peer.funcCallHub.dispatch));
    this.channel.onFuncReturn(filterDirectMessage(peer.funcReturnHub.dispatch));
    this.channel.onQuit(filterDirectMessage(peer.quitHub.dispatch));

    this.peers.set(from, peer);
    this.#addHub.dispatch(peer);
  };

  #peerLeave = ({ from }: QuitMessage): void => {
    if (!this.peers.has(from)) return;
    const peer = this.peers.get(from)!;
    this.peers.delete(from);
    this.#leaveHub.dispatch(peer);
  };

  close = () => {
    this.peers.forEach((peer) => peer.postQuit());
  };
}

const createMessageFilter =
  ({ from, to }: { from?: string; to?: string }) =>
  <M extends Message>(callback: (message: M) => void): ((message: M) => void) =>
  (message: Message) => {
    if (
      (!from || ("from" in message && message.from === from)) &&
      (!to || ("to" in message && message.to === to))
    ) {
      callback(message as M);
    }
  };
