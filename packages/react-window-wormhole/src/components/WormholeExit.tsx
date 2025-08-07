import * as React from "react";
import { useEffect, useState } from "react";
import { Message, MessageFlags, sendMessage } from "../Messager.js";
import { resolveTransferable, Transferable } from "../model/Transferable.js";
import { isCrossOrigin } from "../utils.js";

function setUpListeners(handleProps: (vp: Transferable) => void) {
  if (!window.opener) return;

  const opener = window.opener;
  // close when opener reloads/redirect to prevent complex communication problem
  opener.addEventListener("beforeunload", () => window.close());

  sendMessage(opener, {
    type: MessageFlags.SYNC_INIT,
  });

  const messageEventListener = (e: MessageEvent) => {
    const rawMessage = e.data as Message;
    switch (rawMessage.type) {
      case MessageFlags.SEND_DATA: {
        const call = (name: string, args: Transferable[]) => {
          sendMessage(opener, {
            type: MessageFlags.FUNC_CALL,
            data: [name, args],
          });
        };
        const props = resolveTransferable(rawMessage.data /* , call */);
        handleProps(props);
        break;
      }
    }
  };
  window.addEventListener("message", messageEventListener);
  return () => window.removeEventListener("message", messageEventListener);
}

export function WormholeExit<TP = {}>({
  children,
}: {
  children: (message: Transferable | null) => React.ReactElement;
}) {
  const [props, setProps] = useState<Transferable | null>(null);
  useEffect(() => setUpListeners(setProps), []);

  const opener = window.opener;
  if (!opener) return <span>no opener</span>;
  if (isCrossOrigin(opener)) return <span>parent window redirected.</span>;
  return children(props);
}
