import * as React from 'react'
import { WormholeExit } from './react-window-wormhole'

export type Props = {
  count: number
  onAdd(val: number): void
}

export function Child() {
  return (
    <WormholeExit<Props>>
      {(data) => (
        <div className="App">
          <header className="App-header">
            <h2>child page</h2>
            {data && (
              <div>
                <h4>Serialized data:</h4>
                <pre style={{ textAlign: 'left' }}>
                  {JSON.stringify(data, null, 2)}
                </pre>
                <button onClick={() => data.onAdd(-1)}>minus</button>
              </div>
            )}
          </header>
        </div>
      )}
    </WormholeExit>
  )
}
