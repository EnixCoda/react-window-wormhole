import { mapValues } from "../keys.js";
import { Transferable } from "./type.js";

export type DecodeTransformContext = {
  generateCallable: <
    Args extends any[] = Transferable.Inputs.Arr,
    I extends Transferable.Input | void = void,
  >(
    path: Transferable.FieldKey[],
  ) => Transferable.Transferred<Transferable.Inputs.Callable<Args, I>>;
};

export const decodeTransferable = <I>(
  [type, value]: Transferable.Encoded<I>,
  context: DecodeTransformContext,
): Transferable.Transferred<I> => {
  switch (type) {
    case "lossless":
      return value as Transferable.Transferred<I>;
    case "callable":
      return context.generateCallable(
        value,
      ) as unknown as Transferable.Transferred<I>;
    case "object":
      return decodeTransferableObject<I>(
        [type, value],
        context,
      ) as Transferable.Transferred<I>;
    case "array":
      return value.map((v) =>
        decodeTransferable<I>(v, context),
      ) as unknown as Transferable.Transferred<I>;
    case "unknown":
    default:
      console.warn(`Unsupported data type to transfer: ${type}`);
      return null as Transferable.Transferred<I>;
  }
};

export const decodeTransferableObject = <D>(
  [type, object]: Transferable.Encode.Object,
  context: DecodeTransformContext,
): Transferable.Transferred<D> =>
  mapValues(object, (value) =>
    decodeTransferable(value, context),
  ) as unknown as Transferable.Transferred<D>;
