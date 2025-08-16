import { describe, expect, it, vi } from "vitest";
import { isTransferableInputOf } from "../transferable/isInput.js";
import {
  resolve,
  transformTransferableInput,
} from "../transferable/transformInput.js";
import { EventHub } from "../utils/EventHub.js";
import { Channel } from "./Channel.js";
import { MessageChannel } from "./MessageChannel.js";
import { P2PClient } from "./P2PClient.js";
import { P2PPeer } from "./P2PPeer.js";
import { DataMessage, FuncCallMessage } from "./TransferableMessage.js";

const createTestChannel = (): Channel => {
  const hub = new EventHub();
  return {
    onMessage(message) {
      hub.addListener(message);
    },
    postMessage(message) {
      hub.dispatch(message);
    },
  };
};

function createMessageChannels(): [[P2PClient, P2PPeer], [P2PClient, P2PPeer]] {
  const channel = createTestChannel();
  const client = new P2PClient("local", new MessageChannel(channel));
  const remote = new P2PClient("remote", new MessageChannel(channel));

  remote.postInit();
  const remotePeer = client.peers.get("remote");
  if (!remotePeer) throw new Error("Peer not found");

  const localPeer = remote.peers.get("local");
  if (!localPeer) throw new Error("Local peer not found");

  return [
    [client, localPeer],
    [remote, remotePeer],
  ];
}

describe("MessageChannel", () => {
  it("should only respond to acknowledged messages", () => {});

  it("should ignore messages after close", () => {});

  it("should notify remote on close", () => {});

  it("should pass data", () => {
    const [[local, localPeer], [remote, remotePeer]] = createMessageChannels();
    const onData = vi.fn((data: DataMessage["data"]): void => {});
    localPeer.onData(onData);
    remotePeer.postData(transformTransferableInput(1));
    expect(onData).toHaveBeenCalledTimes(1);
    expect(onData).toHaveBeenCalledWith(transformTransferableInput(1));
  });

  it("should pass function calls", () => {
    const [[local, localPeer], [remote, remotePeer]] = createMessageChannels();

    const source = {
      value: 0,
      add(b: number) {
        return (source.value += b);
      },
    };

    const onFuncCall = vi.fn((data: FuncCallMessage["data"]): void => {
      const [path, args] = data;
      const method = resolve(path, source);
      if (isTransferableInputOf.callable(method)) {
        return method(...args);
      }

      throw new Error(`No callable found at path: ${path}`);
    });
    localPeer.onFuncCall(onFuncCall);
    remotePeer.postFuncCall([
      ["add"],
      [1].map((v) => transformTransferableInput(v)),
    ]);
    remotePeer.postFuncCall([
      ["add"],
      [1].map((v) => transformTransferableInput(v)),
    ]);

    expect(onFuncCall).toHaveBeenCalledTimes(2);
    expect(onFuncCall).toHaveBeenNthCalledWith(1, [
      ["add"],
      [1].map((v) => transformTransferableInput(v)),
    ]);
  });
});
