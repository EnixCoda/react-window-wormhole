import * as React from 'react'
import { useEffect, useState } from 'react'
import {
  ValidProps,
  Message,
  undoMakeMessageTransferable,
  sendMessage,
  MessageFlags,
} from './engine'
import { isCrossOrigin } from './utils'

function setUpListeners<TP>(handleProps: (vp: ValidProps<TP>) => void) {
  if (!window.opener) return

  const opener = window.opener
  // close when opener reloads/redirect to prevent complex communication problem
  opener.addEventListener('beforeunload', () => window.close())

  sendMessage(opener, {
    type: MessageFlags.SYNC_INIT,
  })

  const messageEventListener = (e: MessageEvent) => {
    const rawMessage = e.data as Message
    switch (rawMessage.type) {
      case MessageFlags.SEND_DATA: {
        const props = undoMakeMessageTransferable<TP>(rawMessage.data, (name, ...args) => {
          sendMessage(opener, {
            type: MessageFlags.FUNC_CALL,
            data: [name, ...args],
          })
        })
        handleProps(props)
        break
      }
    }
  }
  window.addEventListener('message', messageEventListener)
  return () => window.removeEventListener('message', messageEventListener)
}

export const WormholeExit = function WormholeExit<TP = {}>({
  children,
}: {
  children: (message: ValidProps<TP> | null) => React.ReactElement
}) {
  const [props, setProps] = useState<ValidProps<TP> | null>(null)
  useEffect(() => setUpListeners<TP>(setProps), [])

  const opener = window.opener
  if (!opener) return <span>no opener</span>
  if (isCrossOrigin(opener)) return <span>parent window redirected.</span>
  return children(props)
}
