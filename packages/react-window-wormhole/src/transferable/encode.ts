import { mapValues } from "../keys.js";
import { isDecodedOf } from "./isDecoded.js";
import { Transferable } from "./type.js";

type EncodeTransformContext = {
  path: Transferable.FieldKey[];
};
const defaultTransformContext: EncodeTransformContext = {
  path: [],
};

// forbid 2nd argument
export const encodeTransferable = (value: unknown) =>
  _encodeTransferable(value);

const _encodeTransferable = (
  value: unknown,
  context: EncodeTransformContext = defaultTransformContext,
): Transferable.Encoded => {
  if (isDecodedOf.lossless(value)) return ["lossless", value];
  if (isDecodedOf.object(value))
    return transformToTransferableObject(value, context);
  if (isDecodedOf.array(value))
    return transformToTransferableArray(value, context);
  if (isDecodedOf.callable(value))
    return transformToTransferableCallable(value, context);
  console.warn(`Unsupported data type to transfer:`, value);
  return ["lossless", null];
};

export const transformToTransferableObject = (
  props: Transferable.Decode.Object,
  context: EncodeTransformContext = defaultTransformContext,
): Transferable.Encode.Object => [
  "object",
  mapValues(props, (value, key) =>
    _encodeTransferable(value, {
      ...context,
      path: context.path.concat(key),
    }),
  ),
];

export const transformToTransferableArray = (
  value: Transferable.Decode.Arr,
  context: EncodeTransformContext = defaultTransformContext,
): Transferable.Encode.Arr => [
  "array",
  value.map((item, index) =>
    _encodeTransferable(item, {
      ...context,
      path: context.path.concat(index),
    }),
  ),
];

export const resolve = (
  path: Transferable.FieldKey[],
  target: Transferable.Decoded,
): Transferable.Decoded => {
  if (path.length === 0) {
    return target;
  }

  if (isDecodedOf.object(target)) {
    const [field] = path;
    const value = target[field];
    return resolve(path.slice(1), value);
  }

  if (isDecodedOf.array(target)) {
    const [field] = path;
    if (typeof field !== "number") {
      throw new Error(
        `Expected array index as a number, but got: ${field} in path: ${path.join(
          ".",
        )}`,
      );
    }
    const value = target[field];
    return resolve(path.slice(1), value);
  }

  throw new Error(
    `Cannot resolve path: ${path.join(".")} in target: ${JSON.stringify(
      target,
      null,
      2,
    )}`,
  );
};

export const createCaller = (source: Transferable.Decoded) => {
  return function caller<Args extends Transferable.Decoded[]>(
    path: Transferable.FieldKey[],
    args: Args,
  ) {
    const target = resolve(path, source);
    if (!isDecodedOf.callable(target)) {
      throw new Error(`No callable found at path: ${path}`);
    }

    return target(...args);
  };
};

export const transformToTransferableCallable = (
  value: Transferable.Decode.Callable,
  context: EncodeTransformContext = defaultTransformContext,
): Transferable.Encode.Callable => ["callable", context.path];
