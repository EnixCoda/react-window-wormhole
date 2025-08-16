import { JSX, useEffect, useMemo, useState } from "react";
import { isTransferableInputOf } from "../transferable/isInput.js";
import {
  resolve,
  transformTransferableInput,
} from "../transferable/transformInput.js";
import { Transferable } from "../transferable/type.js";
import { WindowP2PClient } from "../windowMessage/WindowClient.js";

type Options<TP extends Transferable.Inputs.Object> = {
  path: string;
  features?: string;
  supportReload?: boolean;
  reloadDuration?: number; // duration between beforeunload and load event
  props: TP;
};

type Props<TP extends Transferable.Inputs.Object> = Options<TP>;
export function WormholeEntry<P extends Transferable.Inputs.Object>(
  options: Props<P>,
): JSX.Element {
  useWormholeEntry(options);

  return <></>;
}

export function useWormholeEntry<P extends Transferable.Inputs.Object>({
  path,
  features,
  reloadDuration = 1000,
  supportReload,
  props,
}: Options<P>) {
  const [exitWindow, setExitWindow] = useState<Window | null>(null);

  useEffect(() => {
    const newWindow = window.open(path, path, features);
    if (newWindow) {
      setExitWindow(newWindow);
      return () => {
        if (exitWindow && !exitWindow.closed) {
          exitWindow.close();
          setExitWindow(null);
        }
      };
    }

    console.error("failed opening window");
  }, []);

  const client = useMemo(
    () => exitWindow && new WindowP2PClient(exitWindow),
    [exitWindow],
  );

  useEffect(() => {
    if (client) {
      client.onPeerJoin((peer) => {
        peer.postData(transformTransferableInput(props));
        peer.onFuncCall(([path, args]) => {
          const method = resolve(path, props);
          if (isTransferableInputOf.callable(method)) {
            return method(...args);
          }
        });
      });
      return () => client.close();
    }
  }, [client]);
}
