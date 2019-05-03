import React, { useState } from 'react'
import logo from './logo.svg'
import { WormholeEntry } from './react-window-wormhole'
import { Props as ChildProps } from './Child'

export function Home() {
  const [opened, setOpened] = useState(false)
  const [count, setCount] = useState(0)
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <button onClick={() => setOpened((o) => !o)}>
            {opened ? 'close' : 'open'}
          </button>
        </p>
        <h4>Serialized data:</h4>
        <pre style={{ textAlign: 'left' }}>
          {JSON.stringify({ count }, null, 2)}
        </pre>
        <button onClick={() => setCount((c) => c + 1)}>add</button>
        <WormholeEntry<ChildProps>
          opened={opened}
          onClose={() => setOpened(false)}
          path="/child"
          toTransfer={{
            onAdd(val: number) {
              setCount((c) => c + val)
            },
            count,
          }}
        />
      </header>
    </div>
  )
}
