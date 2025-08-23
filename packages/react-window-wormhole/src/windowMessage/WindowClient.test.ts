import { describe, expect, it, vi } from "vitest";
import { WindowP2PClient } from "./WindowClient.js";

describe("Window Client", () => {
  it("should open a new window", () => {
    const newWindow = window.open("");

    if (!newWindow) {
      throw new Error("Failed to open new window");
    }

    const onWindowMessage = vi.fn(() => {});
    newWindow.addEventListener("message", onWindowMessage);
    window.postMessage("");
    newWindow.postMessage("");
    expect(onWindowMessage).toHaveBeenCalled();

    const client1 = new WindowP2PClient(window);

    const client2 = new WindowP2PClient(newWindow.opener);

    const onPeerJoin = vi.fn(() => {});
    client1.onPeerJoin(onPeerJoin);

    expect(onPeerJoin).toHaveBeenCalled();
  });
});
