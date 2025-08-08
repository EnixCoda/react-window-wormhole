import { Transferable } from "./type.js";

const isLossless = (obj: any): obj is Transferable.LosslessInput =>
  typeof obj === "number" ||
  typeof obj === "string" ||
  typeof obj === "boolean" ||
  obj === null ||
  obj === undefined;

const isCallable = (obj: any): obj is Transferable.CallableInput =>
  typeof obj === "function";

const isObject = (obj: any): obj is Transferable.ObjectInput =>
  obj && typeof obj === "object" && !Array.isArray(obj);

const isArray = (obj: any): obj is Transferable.ArrayInput =>
  Array.isArray(obj) && obj.every(isTransferable);

const isTransferable = (obj: any): obj is Transferable.Input =>
  isLossless(obj) || isCallable(obj) || isObject(obj) || isArray(obj);

export const isTransferableInputOf = {
  lossless: isLossless,
  callable: isCallable,
  object: isObject,
  array: isArray,
  any: isTransferable,
};
