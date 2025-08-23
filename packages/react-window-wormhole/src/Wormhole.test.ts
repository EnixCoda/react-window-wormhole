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

    const entrance = new Wormhole.Entrance(client);
    const exit = new Wormhole.Exit(remote);

    console.log("creating peers");
    createTestPeers(client, remote);

    console.log("feeding data");
    const toTransfer = {
      name: "Tim",
      age: 30,
      grow(age: number = 1) {
        return (toTransfer.age += age);
      },
      getGrow() {
        return toTransfer.grow;
      },
    };

    // feed before peer join
    entrance.feed(toTransfer);

    console.log("waiting for data");
    const controlledPromise = createControlledPromise();
    exit.onReceive(controlledPromise.resolve);

    console.log("waiting transfer");
    const _transferred = (await controlledPromise.promise) as typeof toTransfer;
    {
      expect(_transferred.age).toBe(toTransfer.age);
    }

    {
      expect(_transferred.name).toBe(toTransfer.name);
    }

    console.log("testing methods");
    {
      expect(_transferred.grow).toBeTypeOf("function");
      const grown1 = await _transferred.grow(1);
      expect(grown1).toBe(31);
      const grown2 = await _transferred.grow(2);
      expect(grown2).toBe(33);
      expect(toTransfer.age).toBe(33);
      expect(_transferred.age).toBe(30);
    }

    {
      expect(_transferred.getGrow).toBeTypeOf("function");
      const grow = await _transferred.getGrow();
      expect(grow).toBeTypeOf("function");
      const grown = await grow();
      expect(grown).toBe(34);
      expect(toTransfer.age).toBe(34);
      expect(_transferred.age).toBe(30);
    }
  });
});
