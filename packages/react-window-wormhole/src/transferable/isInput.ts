import { Transferable } from "./type.js";

const isLossless = (obj: any): obj is Transferable.Inputs.Lossless =>
  typeof obj === "number" ||
  typeof obj === "string" ||
  typeof obj === "boolean" ||
  obj === null ||
  obj === undefined;

const isCallable = (obj: any): obj is Transferable.Inputs.Callable =>
  typeof obj === "function";

const isObject = (obj: any): obj is Transferable.Inputs.Object =>
  obj && typeof obj === "object" && !Array.isArray(obj);

const isArray = (obj: any): obj is Transferable.Inputs.Arr =>
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
