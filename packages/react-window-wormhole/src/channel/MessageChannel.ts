import { EventHub } from "../utils/EventHub.js";
import { Channel } from "./Channel.js";
import {
  AckMessage,
  DataMessage,
  FuncCallMessage,
  FuncReturnMessage,
  isMessage,
  MessageTypes,
  QuitMessage,
  SynAckMessage,
  SynMessage,
} from "./TransferableMessage.js";

export class MessageChannel {
  constructor(private channel: Channel) {
    this.channel.onMessage((message) => {
      if (isMessage(message)) {
        switch (message.type) {
          case MessageTypes.SYNC:
            return this.#synMessageHub.dispatch(message);
          case MessageTypes.SYNC_ACK:
            return this.#synAckMessageHub.dispatch(message);
          case MessageTypes.ACK:
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

  #synMessageHub = new EventHub<SynMessage>();
  onSyn = (handler: (message: SynMessage) => void) =>
    this.#synMessageHub.addListener(handler);
  postSyn = ({ from }: Omit<SynMessage, "type">) =>
    this.channel.postMessage({
      type: MessageTypes.SYNC,
      from,
    } satisfies SynMessage);

  #synAckMessageHub = new EventHub<SynAckMessage>();
  onSynAck = (handler: (message: SynAckMessage) => void) =>
    this.#synAckMessageHub.addListener(handler);
  postSynAck = ({ from, to }: Omit<SynAckMessage, "type">) =>
    this.channel.postMessage({
      type: MessageTypes.SYNC_ACK,
      from,
      to,
    } satisfies SynAckMessage);

  #ackMessageHub = new EventHub<AckMessage>();
  onAck = (handler: (message: AckMessage) => void) =>
    this.#ackMessageHub.addListener(handler);
  postAck = ({ from, to }: Omit<AckMessage, "type">) =>
    this.channel.postMessage({
      type: MessageTypes.ACK,
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
