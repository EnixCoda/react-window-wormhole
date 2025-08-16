import { mapValues } from "../keys.js";
import { Transferable } from "./type.js";

export type TransformOutputContext = {
  generateCallable: (
    path: Transferable.FieldKey[],
  ) => Transferable.Inputs.Callable;
};
const defaultContext: TransformOutputContext = {
  generateCallable: (path: Transferable.FieldKey[]) => () => {
    console.warn(
      `No callable context provided, using default callable that does nothing.`,
    );
  },
};

export const transformTransferableOutput = (
  [type, value]: Transferable.Output,
  context: TransformOutputContext = defaultContext,
): Transferable.Input => {
  switch (type) {
    case "lossless":
      return value;
    case "callable":
      return context.generateCallable(value);
    case "object":
      return transformTransferableOutputObject([type, value], context);
    case "array":
      return value.map((v) => transformTransferableOutput(v, context));
    case "unknown":
    default:
      console.warn(`Unsupported data type to transfer: ${type}`);
      return null;
  }
};

export const transformTransferableOutputObject = (
  [type, object]: Transferable.Outputs.Object,
  context: TransformOutputContext = defaultContext,
): Transferable.Inputs.Object =>
  mapValues(object, (value) => transformTransferableOutput(value, context));
