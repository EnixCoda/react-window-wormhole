import { P2PClient } from "./channel/P2PClient.js";
import { Peer } from "./channel/Peer.js";
import { ThreadManager } from "./channel/ThreadManagement.js";
import { RefMessage } from "./channel/TransferableMessage.js";
import { decodeTransferable } from "./transferable/decode.js";
import { encodeTransferable, resolve } from "./transferable/encode.js";
import { isDecodedOf } from "./transferable/isDecoded.js";
import { Transferable } from "./transferable/type.js";
import { EventHub } from "./utils/EventHub.js";
import { NullableValue } from "./utils/NullableValue.js";
import { uuid } from "./utils/uuid.js";

class WormholeEndpoint {
  protected threadManagement = new ThreadManager();

  #postFuncCall<T = unknown>(
    peer: Peer,
    ref: RefMessage["ref"],
    data: Transferable.FieldKey[],
    args: Transferable.Decoded[],
  ): Promise<T> {
    const [thread, { promise }] = this.threadManagement.create<T>();
    peer.postFuncCall({
      data: [data, args.map(encodeTransferable)],
      thread,
      ref,
    });
    return promise;
  }

  protected decode = (
    peer: Peer,
    ref: RefMessage["ref"],
    data: Transferable.Encoded,
  ) =>
    decodeTransferable(data, {
      generateCallable:
        (path) =>
        (...args) =>
          this.#postFuncCall(peer, ref, path, args),
    });
}

export class Entrance<
  T extends Transferable.Decoded = Transferable.Decoded,
> extends WormholeEndpoint {
  toTransfer: NullableValue<[RefMessage["ref"], T]> = undefined;
  resources = new Map<RefMessage["ref"], any>();

  constructor(private client: P2PClient) {
    super();
    this.client.onPeerJoin(this.#setPeer);
  }

  #transfer = (peer: Peer) => {
    if (this.toTransfer === undefined) return;
    console.debug("Transferring data to peer:", this.client.id, "->", peer.id);
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
        const returnValue = method(
          ...args.map((arg) => this.decode(peer, ref, arg)),
        );

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

export class Exit<
  T extends Transferable.Decoded = Transferable.Decoded,
> extends WormholeEndpoint {
  threadManagement = new ThreadManager();

  constructor(private client: P2PClient) {
    super();
    this.client.onPeerJoin(this.#setPeer);
  }

  #setPeer = (peer: Peer) => {
    peer.onData((message) =>
      this.#dataHub.dispatch(this.decode(peer, message.ref, message.data) as T),
    );
    peer.onFuncReturn((message) =>
      this.threadManagement
        .get(message.thread)
        ?.resolve(this.decode(peer, message.ref, message.data)),
    );
  };

  #dataHub = new EventHub<T>(true);
  onReceive(handler: (data: T) => void) {
    this.#dataHub.addListener(handler);
  }
}

export const Wormhole = {
  Entrance,
  Exit,
};
