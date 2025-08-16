import { EventHub } from "../utils/EventHub.js";
import { MessageChannel } from "./MessageChannel.js";
import { P2PPeer } from "./P2PPeer.js";
import {
  DataMessage,
  FuncCallMessage,
  FuncReturnMessage,
} from "./TransferableMessage.js";

export class P2PClient {
  peers = new Map<string, P2PPeer>();

  dataHub = new EventHub<DataMessage["data"]>();
  funcCallHub = new EventHub<FuncCallMessage["data"]>();
  funcReturnHub = new EventHub<FuncReturnMessage["data"]>();

  constructor(
    readonly id: string,
    private channel: MessageChannel,
  ) {
    channel.onInit((message) => {
      this.#addPeer(message.from);
      this.#postAck(message.from);
    });
    channel.onAck((message) => {
      if (message.to === this.id) this.#addPeer(message.from);
    });
    channel.onQuit((message) => {
      this.#removePeer(message.from);
    });
    channel.onDataMessage((message) => {
      if (this.id === message.to) this.dataHub.dispatch(message.data);
    });
    channel.onFuncCall((message) => {
      if (this.id === message.to) this.funcCallHub.dispatch(message.data);
    });
    channel.onFuncReturn((message) => {
      if (this.id === message.to) this.funcReturnHub.dispatch(message.data);
    });
  }

  #postAck(to: string) {
    this.channel.postAck(this.id, to);
  }

  postInit() {
    this.channel.postInit(this.id);
  }

  #addPeer = (peerId: P2PPeer["id"]): void => {
    if (peerId === this.id) {
      console.warn(`Cannot add self as a peer.`);
      return;
    }

    if (this.peers.has(peerId)) {
      console.warn(`Peer with id ${peerId} already exists.`);
      return;
    }

    const peer = new P2PPeer(peerId, this.id, this.channel);
    this.peers.set(peerId, peer);
    this.#joinHub.dispatch(peer);
  };

  #removePeer = (peerId: P2PPeer["id"]): void => {
    if (!this.peers.has(peerId)) return;
    const peer = this.peers.get(peerId)!;
    this.peers.delete(peerId);
    this.#leaveHub.dispatch(peer);
  };

  #leaveHub = new EventHub<P2PPeer>();
  onPeerLeave = (handler: (peer: P2PPeer) => void) =>
    this.#leaveHub.addListener(handler);

  #joinHub = new EventHub<P2PPeer>();
  onPeerJoin = (handler: (peer: P2PPeer) => void) =>
    this.#joinHub.addListener(handler);

  close = () => {
    this.peers.forEach((peer) => peer.postQuit());
  };
}
