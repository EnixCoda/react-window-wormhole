# react-window-wormhole

Extend your React App to other browser windows.

## Demo

![](https://thumbs.gfycat.com/BetterIncompatibleCapybara.webp)

## Usage

### Install from npm

```bash
yarn add react-window-wormhole
```

### Basic example

> It's good to have router in the app if you want to use `react-window-wormhole`. Detailed example code is available [here](https://github.com/EnixCoda/react-window-wormhole/tree/master/example).
>
> Code below is written in TypeScript.

```tsx
// parent window
import { WormholeEntry } from 'react-window-wormhole'

interface PropsToTransfer {
  onAdd(val: number): void
  count: number
}

function Parent() {
  const [opened, setOpened] = useState(false)
  const [count, setCount] = useState(0)
  return (
    /* Data flows into entry of wormhole */
    <WormholeEntry<PropsToTransfer>
      {/* which path should child window */}
      path="/child"
      opened={opened}
      onClose={() => setOpened(false)}
      toTransfer={{
        onAdd(val: number) {
          setCount(c => c + val)
        },
        count,
      }}
    />
  )
}
```

```tsx
// child window. render Child for path `/child`
import { WormholeExit } from 'react-window-wormhole'

function Child() {
  return (
    /* Exit is where data flows out */
    <WormholeExit<PropsToTransfer>>
      {props => (
        /* this `props` looks same as `toTransfer` */
        <button onClick={() => props.onAdd(1)}>{props.count}</button>
      )}
    </WormholeExit>
  )
}
```

## API

### WormholeEntry's props

| Name             | Type                           | Description                                                                                                                                                                                                                                                                                                                                             |
| ---------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`           | `string`                       | The path that child window should be opened in.                                                                                                                                                                                                                                                                                                         |
| `opened`         | `boolean`                      | Control child window to be opened or closed.                                                                                                                                                                                                                                                                                                            |
| `onClose`        | `() => void`                   | Callback to close child window, i.e. setting `opened` to false. **Not** callback when window is closed.                                                                                                                                                                                                                                                 |
| `toTransfer`     | `object`                       | The props to pass to child window. You can pass plain object with values of [transferable data](https://developer.mozilla.org/en-US/docs/Web/API/Transferable) **and functions**. You can simply take _transferable data_ as something that can be safely handled by `JSON.stringify`. Arguments passed to those functions should be transferable data. |
| `supportReload`  | `boolean?` (defaults to false) | _It's not recommended to enable this._ Enabling this will prevent child window to be closed when refresh. But delays the invoke of `onClose`.                                                                                                                                                                                                           |
| `reloadDuration` | `number?` (defaults to 1000)   | The duration between child window close and the invoke of `onClose`. It's dangerous to decrease its value.                                                                                                                                                                                                                                              |

### WormholeExit's props

| Name       | Type              | Description                           |
| ---------- | ----------------- | ------------------------------------- |
| `children` | `(props) => void` | Children should be a render function. |

### License

MIT
