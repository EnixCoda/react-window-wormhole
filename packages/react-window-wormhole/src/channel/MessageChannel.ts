import {
  DataMessage,
  FuncMessage,
  isMessage,
  Message,
  MessageTypes,
} from "../message/Message.js";
import { transformTransferableInput } from "../transferable/transformInput.js";
import { Channel } from "./Channel.js";

export interface MessageChannel {
  close: () => void;
  postMessage: (message: Message) => void;
  onInitMessage: (handler: () => void) => void;
  onDataMessage: (handler: (message: DataMessage) => void) => void;
  onFuncMessage: (handler: (message: FuncMessage) => void) => void;
}

export const createMessageChannel = (channel: Channel): MessageChannel => {
  let _onInitMessage: (message: Message) => void;
  let _onDataMessage: (message: DataMessage) => void;
  let _onFuncMessage: (message: FuncMessage) => void;
  channel.onMessage((rawMessage) => {
    if (isMessage(rawMessage)) {
      switch (rawMessage.type) {
        case MessageTypes.SYNC_INIT:
          return _onInitMessage?.(rawMessage);
        case MessageTypes.SEND_DATA:
          return _onDataMessage?.(rawMessage);
        case MessageTypes.FUNC_CALL:
          return _onFuncMessage?.(rawMessage);
      }
    }

    console.warn(`Unsupported message type received:`, rawMessage);
  });
  return {
    close: channel.close,
    postMessage: (message) => {
      if (message.type === MessageTypes.SEND_DATA) {
        channel.postMessage({
          type: MessageTypes.SEND_DATA,
          data: transformTransferableInput(message),
        });
      } else {
        channel.postMessage(message);
      }
    },
    onInitMessage: (handler) => {
      _onInitMessage = handler;
    },
    onDataMessage: (handler) => {
      _onDataMessage = handler;
    },
    onFuncMessage: (handler) => {
      _onFuncMessage = handler;
    },
  };
};
