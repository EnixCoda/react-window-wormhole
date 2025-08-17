import { EventHub } from "../../utils/EventHub.js";
import { Channel } from "../Channel.js";
import { MessageChannel } from "../MessageChannel.js";
import { P2PClient } from "../P2PClient.js";
import { Peer } from "../Peer.js";

export const createTestChannel = (): Channel => {
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

export function createMessageClients(): [P2PClient, P2PClient] {
  const channel = createTestChannel();
  channel.onMessage((message) => console.debug(message));
  const local = new P2PClient("local", new MessageChannel(channel));
  const remote = new P2PClient("remote", new MessageChannel(channel));

  return [local, remote];
}

export function createTestPeers(
  local: P2PClient,
  remote: P2PClient,
): [Peer, Peer] {
  local.postInit();

  const localPeer = remote.peers.get("local");
  if (!localPeer) throw new Error("Local peer not found");

  const remotePeer = local.peers.get("remote");
  if (!remotePeer) throw new Error("Remote peer not found");
  return [localPeer, remotePeer];
}
