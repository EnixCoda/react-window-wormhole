import { describe, expect, it, vi } from "vitest";
import { encodeTransferable, resolve } from "../transferable/encode.js";
import { isDecodedOf } from "../transferable/isDecoded.js";
import { DataMessage, FuncCallMessage } from "./TransferableMessage.js";
import {
  createMessageClients,
  createTestPeers,
} from "./__test__/createTestChannel.js";

describe("MessageChannel", () => {
  it("should only respond to acknowledged messages", () => {});

  it("should ignore messages after close", () => {});

  it("should notify remote on close", () => {});

  it("should pass data", () => {
    const [local, remote] = createMessageClients();
    const [localPeer, remotePeer] = createTestPeers(local, remote);

    const onData = vi.fn((data: DataMessage): void => {});
    localPeer.onData(onData);
    remotePeer.postData({ ref: "", data: encodeTransferable(1) });
    expect(onData).toHaveBeenCalledTimes(1);
    expect(onData.mock.calls).toMatchInlineSnapshot(`
      [
        [
          {
            "data": [
              "lossless",
              1,
            ],
            "from": "local",
            "ref": "",
            "to": "remote",
            "type": "SEND_DATA",
          },
        ],
      ]
    `);
  });

  it("should pass function call and return value", () => {
    const [local, remote] = createMessageClients();
    const [localPeer, remotePeer] = createTestPeers(local, remote);

    const source = {
      value: 0,
      add(b: number) {
        return (source.value += b);
      },
    };

    const onFuncCall = vi.fn(({ data }: FuncCallMessage) => {
      const [path, args] = data;
      const method = resolve(path, source);
      if (isDecodedOf.callable(method)) {
        return method(...args);
      }

      throw new Error(`No callable found at path: ${path}`);
    });
    localPeer.onFuncCall(onFuncCall);

    remotePeer.postFuncCall({
      data: [["add"], [1].map(encodeTransferable)],
      ref: "",
      thread: "test-thread",
    });
    remotePeer.postFuncCall({
      data: [["add"], [1].map(encodeTransferable)],
      ref: "",
      thread: "test-thread",
    });
  });
});
