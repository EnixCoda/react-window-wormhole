import { describe, expect, it } from "vitest";
import { WindowP2PClient } from "./WindowClient.js";

describe("P2P Client", () => {
  it("", () => {
    const newWindow = window.open("");

    const client1 = new WindowP2PClient(window.opener);
    client1.getOnline();

    const client2 = new WindowP2PClient(newWindow!);
    client2.getOnline();

    expect(client1);
  });
});
