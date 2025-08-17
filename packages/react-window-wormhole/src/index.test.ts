import { describe, expect, it } from "vitest";
import {
  createMessageClients,
  createTestPeers,
} from "./channel/__test__/createTestChannel.js";
import { createControlledPromise } from "./utils/ControlledPromise.js";
import { Wormhole } from "./Wormhole.js";

describe("wormhole", () => {
  it("should open on the other side", async () => {
    const [client, remote] = createMessageClients();

    const toTransfer = {
      name: "Tim",
      age: 30,
      grow() {
        return (toTransfer.age += 1);
      },
      getGrow() {
        return toTransfer.grow;
      },
    };

    const entrance = new Wormhole.Entrance(client);
    const exit = new Wormhole.Exit(remote);

    createTestPeers(client, remote);
    entrance.feed(toTransfer);

    const controlledPromise = createControlledPromise();
    exit.onReceive(controlledPromise.resolve);

    const _transferred = (await controlledPromise.promise) as typeof toTransfer;
    {
      expect(_transferred.age).toBe(toTransfer.age);
    }

    {
      expect(_transferred.name).toBe(toTransfer.name);
    }

    {
      expect(_transferred.grow).toBeTypeOf("function");
      const grown = await _transferred.grow();
      expect(grown).toBe(31);
      expect(toTransfer.age).toBe(31);
      expect(_transferred.age).toBe(30);
    }

    {
      expect(_transferred.getGrow).toBeTypeOf("function");
      const grow = await _transferred.getGrow();
      expect(grow).toBeTypeOf("function");
      const grown = await grow();
      expect(grown).toBe(32);
      expect(toTransfer.age).toBe(32);
      expect(_transferred.age).toBe(30);
    }
  });
});
