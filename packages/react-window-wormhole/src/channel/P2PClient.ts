import { EventHub } from "../utils/EventHub.js";
import { uuid } from "../utils/uuid.js";
import { MessageChannel } from "./MessageChannel.js";
import { Peer } from "./Peer.js";
import {
  AckMessage,
  DataMessage,
  FuncCallMessage,
  FuncReturnMessage,
  Message,
  QuitMessage,
  SourcedMessage,
  SynAckMessage,
  SynMessage,
} from "./TransferableMessage.js";

export class P2PClient {
  peers = new Map<string, Peer>();

  // hubs for AppMessage
  dataHub = new EventHub<DataMessage>();
  funcCallHub = new EventHub<FuncCallMessage>();
  funcReturnHub = new EventHub<FuncReturnMessage>();

  constructor(
    private channel: MessageChannel,
    readonly id = uuid(),
  ) {
    this.#listenToChannel();
    this.#postSyn();
  }

  #listenToChannel() {
    const channel = this.channel;
    channel.onSyn(this.#onSyn);
    channel.onQuit(this.#onQuit);
    const filterToClientMessage = createMessageFilter({ to: this.id });
    channel.onSynAck(filterToClientMessage(this.#onSynAck));
    channel.onAck(filterToClientMessage(this.#onAck));
    channel.onDataMessage(filterToClientMessage(this.dataHub.dispatch));
    channel.onFuncCall(filterToClientMessage(this.funcCallHub.dispatch));
    channel.onFuncReturn(filterToClientMessage(this.funcReturnHub.dispatch));
  }

  #onSyn = (message: SynMessage) => {
    if (message.from === this.id) return;
    this.#postSynAck({ to: message.from });
  };
  #postSyn = () => this.channel.postSyn({ from: this.id });

  #onSynAck = ({ from }: SynAckMessage): void => {
    this.#postAck({ to: from });
    this.#peerJoin({ from });
  };
  #postSynAck = ({ to }: Pick<SynAckMessage, "to">) =>
    this.channel.postSynAck({ from: this.id, to });

  #onAck = ({ from }: AckMessage): void => this.#peerJoin({ from });
  #postAck = ({ to }: Pick<AckMessage, "to">) =>
    this.channel.postAck({ from: this.id, to });

  #addHub = new EventHub<Peer>();
  onPeerJoin = (handler: (peer: Peer) => void) => {
    this.peers.forEach((peer) => handler(peer));
    return this.#addHub.addListener(handler);
  };

  #leaveHub = new EventHub<Peer>();
  onPeerLeave = (handler: (peer: Peer) => void) =>
    this.#leaveHub.addListener(handler);

  #peerJoin = ({ from }: SourcedMessage): void => {
    if (from === this.id) {
      console.warn(`Cannot add self as a peer.`);
      return;
    }

    if (this.peers.has(from)) {
      console.warn(this.id, `Peer with id ${from} already exists.`);
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

    console.debug(this.id, `Peer joined: ${from}`);
  };

  #onQuit = ({ from }: QuitMessage): void => {
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
