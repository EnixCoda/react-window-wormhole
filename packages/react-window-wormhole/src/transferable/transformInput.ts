import { mapValues } from "../keys.js";
import { isTransferableInputOf } from "./isInput.js";
import { Transferable } from "./type.js";

type TransformInputContext = {
  path: Transferable.FieldKey[];
};
const defaultTransformContext: TransformInputContext = {
  path: [],
};

export const transformTransferableInput = (
  value: unknown,
  context: TransformInputContext = defaultTransformContext,
): Transferable.Output => {
  if (isTransferableInputOf.lossless(value)) return ["lossless", value];
  if (isTransferableInputOf.object(value))
    return transformToTransferableObject(value, context);
  if (isTransferableInputOf.array(value))
    return transformToTransferableArray(value, context);
  if (isTransferableInputOf.callable(value))
    return transformToTransferableCallable(value, context);
  console.warn(`Unsupported data type to transfer:`, value);
  return ["lossless", null];
};

export const transformToTransferableObject = (
  props: Transferable.Inputs.Object,
  context: TransformInputContext = defaultTransformContext,
): Transferable.Outputs.Object => [
  "object",
  mapValues(props, (value, key) =>
    transformTransferableInput(value, {
      ...context,
      path: context.path.concat(key),
    }),
  ),
];

export const transformToTransferableArray = (
  value: Transferable.Inputs.Arr,
  context: TransformInputContext = defaultTransformContext,
): Transferable.Outputs.Arr => [
  "array",
  value.map((item, index) =>
    transformTransferableInput(item, {
      ...context,
      path: context.path.concat(index),
    }),
  ),
];

export const resolve = (
  path: Transferable.FieldKey[],
  target: Transferable.Input,
): Transferable.Input => {
  if (path.length === 0) {
    return target;
  }

  if (isTransferableInputOf.object(target)) {
    const [field] = path;
    const value = target[field];
    return resolve(path.slice(1), value);
  }

  if (isTransferableInputOf.array(target)) {
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

export const createCaller = (source: Transferable.Input) => {
  return function caller<Args extends Transferable.Input[]>(
    path: Transferable.FieldKey[],
    args: Args,
  ) {
    const target = resolve(path, source);
    if (!isTransferableInputOf.callable(target)) {
      throw new Error(`No callable found at path: ${path}`);
    }

    return target(...args);
  };
};

export const transformToTransferableCallable = (
  value: Transferable.Inputs.Callable,
  context: TransformInputContext = defaultTransformContext,
): Transferable.Outputs.Callable => ["callable", context.path];
