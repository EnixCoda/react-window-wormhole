import { Transferable } from "../transferable/type.js";

export enum MessageTypes {
  SYNC_INIT = "SYNC_INIT",
  FUNC_CALL = "FUNC_CALL",
  SEND_DATA = "SEND_DATA",
}

interface MessageBase<type extends MessageTypes> {
  type: type;
}

export interface InitMessage extends MessageBase<MessageTypes.SYNC_INIT> {}

export interface DataMessage extends MessageBase<MessageTypes.SEND_DATA> {
  data: Transferable.Output;
}

export interface FuncMessage extends MessageBase<MessageTypes.FUNC_CALL> {
  data: [string | number, Transferable.Output[]];
}

export type Message = InitMessage | DataMessage | FuncMessage;

export const isMessage = (x: unknown): x is Message => {
  if (typeof x !== "object") return false;
  if (x === null) return false;
  if (!("type" in x)) return false;
  return (
    x.type === MessageTypes.SYNC_INIT ||
    x.type === MessageTypes.SEND_DATA ||
    x.type === MessageTypes.FUNC_CALL
  );
};
