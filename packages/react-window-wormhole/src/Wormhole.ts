import { P2PClient } from "./channel/P2PClient.js";
import { Peer } from "./channel/Peer.js";
import { ThreadManager } from "./channel/ThreadManagement.js";
import { FuncCallMessage, RefMessage } from "./channel/TransferableMessage.js";
import { decodeTransferable } from "./transferable/decode.js";
import { encodeTransferable, resolve } from "./transferable/encode.js";
import { isDecodedOf } from "./transferable/isDecoded.js";
import { Transferable } from "./transferable/type.js";
import { EventHub } from "./utils/EventHub.js";
import { NullableValue } from "./utils/NullableValue.js";
import { uuid } from "./utils/uuid.js";

class CallChain {
  #threadManagement = new ThreadManager();
  #resources = new Map<RefMessage["ref"], any>();

  constructor(
    private peer: Peer,
    private ref: RefMessage["ref"],
  ) {
    this.peer.onFuncReturn((message) => {
      const cc = new CallChain(peer, message.ref);

      this.#threadManagement.get(message.thread)?.resolve(
        decodeTransferable(message.data, {
          generateCallable:
            (path) =>
            (...args) =>
              cc.postFuncCall({
                data: [path, args.map(encodeTransferable)],
              }),
        }),
      );
    });
  }

  postFuncCall<T = unknown>({
    data: [data, args],
  }: Pick<FuncCallMessage, "data">): Promise<T> {
    const [thread, { promise }] = this.#threadManagement.create<T>();
    this.peer.postFuncCall({
      data: [data, args],
      thread,
      ref: this.ref,
    });
    return promise;
  }

  onFuncCall(
    handler: (message: FuncCallMessage) => Promise<Transferable.Decoded>,
  ) {
    this.peer.onFuncCall(async (message) => {
      const returnValue = await handler(message);

      const ref = uuid();
      this.#resources.set(ref, returnValue);
      this.peer.postFuncReturn({
        thread: message.thread,
        ref,
        data: encodeTransferable(returnValue),
      });
    });
  }
}

export class Entrance<T extends Transferable.Decoded = Transferable.Decoded> {
  toTransfer: NullableValue<[RefMessage["ref"], T]> = undefined;

  constructor(private client: P2PClient) {
    this.client.onPeerJoin(this.#setPeer);
  }

  resources = new Map<RefMessage["ref"], any>();

  #transfer = (peer: Peer) => {
    if (this.toTransfer === undefined) return;
    const [ref, data] = this.toTransfer.value;
    peer.postData({
      ref,
      data: encodeTransferable(data),
    });
  };

  #setPeer = (peer: Peer) => {
    peer.onFuncCall(({ ref, thread, data: [path, args] }) => {
      if (this.toTransfer === undefined) {
        console.warn(
          `No data to transfer for path: ${path}. Please feed data before calling functions.`,
        );
        return;
      }

      const resolveSource = this.resources.get(ref);
      const method = resolve(path, resolveSource);
      if (isDecodedOf.callable(method)) {
        const returnValue = method(...args);

        const ref = uuid();
        this.resources.set(ref, returnValue);

        peer.postFuncReturn({
          thread,
          ref,
          data: encodeTransferable(returnValue),
        });
      }
    });
    this.#transfer(peer);
  };

  feed = (data: T) => {
    const ref = uuid();
    this.toTransfer = { value: [ref, data] };
    this.resources.set(ref, data);

    this.client.peers.forEach(this.#transfer);
  };
}

export class Exit<T extends Transferable.Decoded = Transferable.Decoded> {
  #encoded: Transferable.Encoded | null = null;

  constructor(private client: P2PClient) {
    this.client.onPeerJoin((peer) => {
      peer.onData((message) => {
        const cc = new CallChain(peer, message.ref);
        const transferred = decodeTransferable(message.data, {
          generateCallable:
            (path) =>
            (...args) =>
              cc.postFuncCall({
                data: [path, args.map(encodeTransferable)],
              }),
        }) as T;
        this.#dataHub.dispatch(transferred);
      });
    });
  }

  #dataHub = new EventHub<T>(true);
  onReceive(handler: (data: T) => void) {
    this.#dataHub.addListener(handler);
  }
}

export const Wormhole = {
  Entrance,
  Exit,
};
