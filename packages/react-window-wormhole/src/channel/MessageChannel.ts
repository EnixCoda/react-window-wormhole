import { EventHub } from "../utils/EventHub.js";
import { Channel } from "./Channel.js";
import {
  AckMessage,
  DataMessage,
  FuncCallMessage,
  FuncReturnMessage,
  InitMessage,
  isMessage,
  MessageTypes,
  QuitMessage,
} from "./TransferableMessage.js";

export class MessageChannel {
  constructor(private channel: Channel) {
    this.channel.onMessage((message) => {
      if (isMessage(message)) {
        switch (message.type) {
          case MessageTypes.SYNC_INIT:
            return this.#initMessageHub.dispatch(message);
          case MessageTypes.SYNC_ACK:
            return this.#ackMessageHub.dispatch(message);
          case MessageTypes.SEND_DATA:
            return this.#dataMessageHub.dispatch(message);
          case MessageTypes.FUNC_CALL:
            return this.#funcCallMessageHub.dispatch(message);
          case MessageTypes.FUNC_RETURN:
            return this.#funcReturnMessageHub.dispatch(message);
          case MessageTypes.SYNC_QUIT:
            return this.#quitMessageHub.dispatch(message);
        }
      }
      console.warn(`Unsupported message type received:`, message);
    });
  }

  #initMessageHub = new EventHub<InitMessage>();
  onInit = (handler: (message: InitMessage) => void) =>
    this.#initMessageHub.addListener(handler);
  postInit = ({ from }: Omit<InitMessage, "type">) =>
    this.channel.postMessage({
      type: MessageTypes.SYNC_INIT,
      from,
    } satisfies InitMessage);

  #ackMessageHub = new EventHub<AckMessage>();
  onAck = (handler: (message: AckMessage) => void) =>
    this.#ackMessageHub.addListener(handler);
  postAck = ({ from, to }: Omit<AckMessage, "type">) =>
    this.channel.postMessage({
      type: MessageTypes.SYNC_ACK,
      from,
      to,
    } satisfies AckMessage);

  #quitMessageHub = new EventHub<QuitMessage>();
  onQuit = (handler: (message: QuitMessage) => void) =>
    this.#quitMessageHub.addListener(handler);
  postQuit = ({ from }: Omit<QuitMessage, "type">) =>
    this.channel.postMessage({
      type: MessageTypes.SYNC_QUIT,
      from,
    } satisfies QuitMessage);

  #dataMessageHub = new EventHub<DataMessage>();
  onDataMessage = (handler: (message: DataMessage) => void) =>
    this.#dataMessageHub.addListener(handler);
  postData = ({ ref, from, to, data }: Omit<DataMessage, "type">) => {
    this.channel.postMessage({
      type: MessageTypes.SEND_DATA,
      ref,
      from,
      to,
      data,
    } satisfies DataMessage);
  };

  #funcCallMessageHub = new EventHub<FuncCallMessage>();
  onFuncCall = (handler: (message: FuncCallMessage) => void) =>
    this.#funcCallMessageHub.addListener(handler);
  postFuncCall = ({
    from,
    to,
    ref,
    thread,
    data,
  }: Omit<FuncCallMessage, "type">) => {
    this.channel.postMessage({
      type: MessageTypes.FUNC_CALL,
      data,
      from,
      to,
      ref,
      thread,
    } satisfies FuncCallMessage);
  };

  #funcReturnMessageHub = new EventHub<FuncReturnMessage>();
  onFuncReturn = (handler: (message: FuncReturnMessage) => void) =>
    this.#funcReturnMessageHub.addListener(handler);
  postFuncReturn = ({
    from,
    to,
    ref,
    thread,
    data,
  }: Omit<FuncReturnMessage, "type">) => {
    this.channel.postMessage({
      type: MessageTypes.FUNC_RETURN,
      from,
      to,
      ref,
      thread,
      data,
    } satisfies FuncReturnMessage);
  };
}
