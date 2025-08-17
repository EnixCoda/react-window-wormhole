import { mapValues } from "../keys.js";
import { Transferable } from "./type.js";

export type DecodeTransformContext = {
  generateCallable: (
    path: Transferable.FieldKey[],
  ) => Transferable.Decode.Callable;
};

export const decodeTransferable = (
  [type, value]: Transferable.Encoded,
  context: DecodeTransformContext,
): Transferable.Decoded => {
  switch (type) {
    case "lossless":
      return value;
    case "callable":
      return context.generateCallable(value);
    case "object":
      return decodeTransferableObject([type, value], context);
    case "array":
      return value.map((v) => decodeTransferable(v, context));
    case "unknown":
    default:
      console.warn(`Unsupported data type to transfer: ${type}`);
      return null;
  }
};

export const decodeTransferableObject = (
  [type, object]: Transferable.Encode.Object,
  context: DecodeTransformContext,
): Transferable.Decode.Object =>
  mapValues(object, (value) => decodeTransferable(value, context));
