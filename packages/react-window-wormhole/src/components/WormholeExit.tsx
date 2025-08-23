import { JSX, useEffect, useMemo, useState } from "react";
import { Transferable } from "../transferable/type.js";
import { isCrossOrigin } from "../utils/isCrossOrigin.js";
import { WindowP2PClient } from "../windowMessage/WindowClient.js";
import { Wormhole } from "../Wormhole.js";

interface RendererChildren<P> {
  children: (props: P) => JSX.Element;
}

export function WormholeExit<TP>({
  children,
}: RendererChildren<Transferable.Transferred<TP>>) {
  const opener = window.opener;
  if (!opener) return <span>no opener</span>;
  if (isCrossOrigin(opener)) return <span>parent window redirected.</span>;
  if (opener.closed) {
    return <span>parent window closed.</span>;
  }
  return (
    <PreparedWormholeExit<TP> window={opener}>{children}</PreparedWormholeExit>
  );
}

function PreparedWormholeExit<TP>({
  window,
  children,
}: { window: Window } & RendererChildren<Transferable.Transferred<TP>>) {
  const exit = useMemo(
    () => new Wormhole.Exit<TP>(new WindowP2PClient(window)),
    [window],
  );
  const [props, setProps] = useState<{
    value: Transferable.Transferred<TP>;
  } | null>(null);
  useEffect(() => {
    exit.onReceive((message) => setProps({ value: message }));
  }, []);

  if (props === null) {
    return <span>waiting for props...</span>;
  }
  return <>{children(props.value)}</>;
}
