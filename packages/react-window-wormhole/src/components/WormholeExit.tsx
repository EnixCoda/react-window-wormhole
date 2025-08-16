import { JSX, useEffect, useState } from "react";
import { Message, MessageTypes } from "../channel/TransferableMessage.js";
import { isTransferableOutputOf } from "../transferable/isOutput.js";
import { transformToTransferableArray } from "../transferable/transformInput.js";
import { transformTransferableOutputObject } from "../transferable/transformOutput.js";
import { Transferable } from "../transferable/type.js";
import { isCrossOrigin } from "../utils.js";

function setUpListeners<TP>(handleProps: (vp: TP) => void) {
  if (!window.opener) return;

  const opener = window.opener;
  // close when opener reloads/redirect to prevent complex communication problem
  opener.addEventListener("beforeunload", () => window.close());

  postMessage({
    type: MessageTypes.SYNC_INIT,
  });

  const messageEventListener = (e: MessageEvent) => {
    const rawMessage = e.data as Message;
    switch (rawMessage.type) {
      case MessageTypes.SEND_DATA: {
        const call =
          (path: Transferable.FieldKey[]) =>
          (...args: Transferable.Input[]) => {
            postMessage({
              type: MessageTypes.FUNC_CALL,
              data: [path, transformToTransferableArray(args)[1]],
            });
          };
        if (isTransferableOutputOf.object(rawMessage.data)) {
          const props = transformTransferableOutputObject(rawMessage.data, {
            generateCallable: call,
          });
          handleProps(props as TP);
        } else {
          console.warn(`Unsupported data type received:`, rawMessage.data);
        }
        break;
      }
    }
  };
  window.addEventListener("message", messageEventListener);
  return () => window.removeEventListener("message", messageEventListener);
}

export function WormholeExit<TP>({
  children,
}: {
  children: (props: TP) => JSX.Element;
}) {
  const [props, setProps] = useState<TP | null>(null);
  useEffect(() => {
    setUpListeners<TP>(setProps);
  }, []);

  const opener = window.opener;
  if (!opener) return <span>no opener</span>;
  if (isCrossOrigin(opener)) return <span>parent window redirected.</span>;
  if (opener.closed) {
    return <span>parent window closed.</span>;
  }
  if (props === null) {
    return <span>waiting for props...</span>;
  }
  return children(props);
}
