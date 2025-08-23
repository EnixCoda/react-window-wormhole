import { Transferable } from "./type.js";

const isEncoded = (obj: unknown): obj is Transferable.Encoded =>
  Array.isArray(obj) && obj.length === 2;

const figureEncoded =
  <E extends Transferable.Encoded>(type: E["0"]) =>
  (obj: unknown): obj is E =>
    isEncoded(obj) ? obj[0] === type : false;

const isLossless = figureEncoded<Transferable.Encode.Lossless>("lossless");
const isCallable = figureEncoded<Transferable.Encode.Callable>("callable");
const isObject = figureEncoded<Transferable.Encode.Object>("object");
const isArray = figureEncoded<Transferable.Encode.Arr>("array");
const isUnknown = figureEncoded<Transferable.Encode.Unknown>("unknown");
const isAny = (obj: unknown): obj is Transferable.Encoded =>
  isEncoded(obj) && obj[0] !== "unknown";

export const isEncodedOf = {
  lossless: isLossless,
  callable: isCallable,
  object: isObject,
  array: isArray,
  unknown: isUnknown,
  any: isAny,
};
