import { Transferable } from "./type.js";

const isOutput = (obj: unknown): obj is Transferable.Output =>
  Array.isArray(obj) && obj.length === 2;

const figureOutput =
  <Output extends Transferable.Output>(type: Output["0"]) =>
  (obj: unknown): obj is Output =>
    isOutput(obj) ? obj[0] === type : false;

const isLossless = figureOutput<Transferable.LosslessOutput>("lossless");
const isCallable = figureOutput<Transferable.CallableOutput>("callable");
const isObject = figureOutput<Transferable.ObjectOutput>("object");
const isArray = figureOutput<Transferable.ArrayOutput>("array");
const isUnknown = figureOutput<Transferable.UnknownOutput>("unknown");
const isAny = (obj: unknown): obj is Transferable.Output =>
  isOutput(obj) && obj[0] !== "unknown";

export const isTransferableOutputOf = {
  lossless: isLossless,
  callable: isCallable,
  object: isObject,
  array: isArray,
  unknown: isUnknown,
  any: isAny,
};
