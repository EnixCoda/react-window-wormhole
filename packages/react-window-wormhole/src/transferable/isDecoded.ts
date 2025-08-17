import { Transferable } from "./type.js";

const isLossless = (obj: any): obj is Transferable.Decode.Lossless =>
  typeof obj === "number" ||
  typeof obj === "string" ||
  typeof obj === "boolean" ||
  obj === null ||
  obj === undefined;

const isCallable = (obj: any): obj is Transferable.Decode.Callable =>
  typeof obj === "function";

const isObject = (obj: any): obj is Transferable.Decode.Object =>
  obj && typeof obj === "object" && !Array.isArray(obj);

const isArray = (obj: any): obj is Transferable.Decode.Arr =>
  Array.isArray(obj) && obj.every(isTransferable);

const isTransferable = (obj: any): obj is Transferable.Decoded =>
  isLossless(obj) || isCallable(obj) || isObject(obj) || isArray(obj);

export const isDecodedOf = {
  lossless: isLossless,
  callable: isCallable,
  object: isObject,
  array: isArray,
  any: isTransferable,
};
