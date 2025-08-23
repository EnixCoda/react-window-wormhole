import { JSX, useEffect, useMemo, useState } from "react";
import { Transferable } from "wormhole/transferable/type";
import { Wormhole } from "wormhole/Wormhole";
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

  useEffect(() => () => client?.close(), [client]);

  const wormhole = useMemo(
    () => (client ? new Wormhole.Entrance(client) : null),
    [client],
  );

  useEffect(() => {
    if (!wormhole) return;
    wormhole.feed(props);
  }, [wormhole, props]);
}
