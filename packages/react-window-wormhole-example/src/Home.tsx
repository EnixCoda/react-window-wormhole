import { useState } from "react";
import { WormholeEntry } from "react-window-wormhole";
import type { Props as ChildProps } from "./Child";

export function Home() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <div className="App">
      <header className="App-header">
        <p>
          <button onClick={() => setOpen((o) => !o)}>
            {open ? "close" : "open"}
          </button>
        </p>
        <h4>Serialized data:</h4>
        <pre style={{ textAlign: "left" }}>
          {JSON.stringify({ count }, null, 2)}
        </pre>
        <button onClick={() => setCount((c) => c + 1)}>add</button>
        <WormholeEntry<ChildProps>
          open={open}
          onClose={() => setOpen(false)}
          path="/child"
          props={{
            onAdd(val: number) {
              setCount((c) => c + val);
              return null;
            },
            count,
          }}
        />
      </header>
    </div>
  );
}
