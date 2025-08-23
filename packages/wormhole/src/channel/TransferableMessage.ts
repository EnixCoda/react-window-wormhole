import { values } from "../keys.js";
import { Transferable } from "../transferable/type.js";

export enum MessageTypes {
  SYNC = "SYNC_INIT",
  SYNC_ACK = "SYNC_ACK",
  ACK = "ACK",
  SYNC_QUIT = "SYNC_QUIT",
  SEND_DATA = "SEND_DATA",
  FUNC_CALL = "FUNC_CALL",
  FUNC_RETURN = "FUNC_RETURN",
}

interface BaseMessage<type extends MessageTypes> extends SourcedMessage {
  type: type;
}

interface BaseDataMessage<type extends MessageTypes, D>
  extends BaseMessage<type> {
  data: D;
}

export interface SynMessage extends BaseMessage<MessageTypes.SYNC> {}
export interface SynAckMessage
  extends TargetedMessage,
    BaseMessage<MessageTypes.SYNC_ACK> {}
export interface AckMessage
  extends TargetedMessage,
    BaseMessage<MessageTypes.ACK> {}
export interface QuitMessage extends BaseMessage<MessageTypes.SYNC_QUIT> {}

export interface SourcedMessage {
  from: string;
}

export interface TargetedMessage {
  to: string;
}

export interface DataMessage
  extends TargetedMessage,
    RefMessage,
    BaseDataMessage<MessageTypes.SEND_DATA, Transferable.Encoded> {}

export interface RefMessage {
  ref: string;
}

export interface ThreadMessage {
  thread: string;
}

export interface FuncCallMessage
  extends TargetedMessage,
    RefMessage,
    ThreadMessage,
    BaseDataMessage<
      MessageTypes.FUNC_CALL,
      [
        Transferable.Encode.PayloadOf<Transferable.Encode.Callable>,
        Transferable.Encoded[], // arguments
      ]
    > {}

export interface FuncReturnMessage
  extends TargetedMessage,
    RefMessage,
    ThreadMessage,
    BaseDataMessage<MessageTypes.FUNC_RETURN, Transferable.Encoded> {}

export type ControlMessage =
  | SynMessage
  | SynAckMessage
  | AckMessage
  | QuitMessage;
export type AppMessage = DataMessage | FuncCallMessage | FuncReturnMessage;
export type Message = ControlMessage | AppMessage;

export type ChannelMessage = {};

export const isMessage = (x: unknown): x is Message => {
  if (typeof x !== "object") return false;
  if (x === null) return false;
  if (!("type" in x)) return false;
  return values(MessageTypes).includes(x.type as MessageTypes);
};
