import { isCrossOrigin } from './utils'

type Transferable = number | string | boolean | object | null | undefined

export type ValidProps<TP = void> = {
  [key: string]: Function | Transferable
} & (TP extends void ? {} : TP)

type TransferableProp = {
  type: 'data' | 'function'
  data: Transferable
}

type TransferableProps = {
  [key: string]: TransferableProp
}

export enum MessageFlags {
  SYNC_INIT = 'SYNC_ON_INITIALIZATION',
  FUNC_CALL = 'FUNCTION_CALL',
  SEND_DATA = 'SEND_DATA',
}

export type Message =
  | {
      type: MessageFlags.SYNC_INIT
    }
  | {
      type: MessageFlags.SEND_DATA
      data: TransferableProps
    }
  | {
      type: MessageFlags.FUNC_CALL
      data: [string, ...Transferable[]]
    }

export function sendMessage(win: Window, message: Message) {
  try {
    if (!isCrossOrigin(win)) win.postMessage(message, '*')
  } catch (err) {
    console.error(err)
  }
}

function makeMessageTransferable(props: ValidProps): TransferableProps {
  return Object.keys(props).reduce(
    (processed, key) => {
      const processedField: TransferableProp = {
        data: undefined,
        type: 'data',
      }
      switch (typeof props[key]) {
        case 'function':
          processedField.type = 'function'
          processedField.data = key
          break
        case 'boolean':
        case 'number':
        case 'string':
        case 'undefined':
        case 'object':
          processedField.data = props[key]
          break
        default:
          break
      }
      processed[key] = processedField
      return processed
    },
    {} as TransferableProps,
  )
}

export function sendData(win: Window, message: ValidProps) {
  return sendMessage(win, {
    type: MessageFlags.SEND_DATA,
    data: makeMessageTransferable(message),
  })
}

export function undoMakeMessageTransferable<TP>(
  processed: TransferableProps,
  call: (name: string, ...args: Transferable[]) => any,
): ValidProps<TP> {
  return Object.keys(processed).reduce(
    (msg, key) => {
      switch (processed[key].type) {
        case 'function': {
          msg[key] = (...args: Transferable[]) => {
            call(key, ...args)
          }
          break
        }
        case 'data': {
          msg[key] = processed[key].data
          break
        }
      }
      return msg
    },
    {} as ValidProps<TP>,
  )
}
