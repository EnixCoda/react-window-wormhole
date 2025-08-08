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
    return transformToTransferableObject(value);
  if (isTransferableInputOf.array(value))
    return [
      "array",
      value.map((item, index) =>
        transformTransferableInput(item, {
          ...context,
          path: context.path.concat(index),
        }),
      ),
    ];
  if (isTransferableInputOf.callable(value)) return ["callable", context.path];
  console.warn(`Unsupported data type to transfer:`, value);
  return ["lossless", null];
};

export const transformToTransferableObject = (
  props: Transferable.ObjectInput,
  context: TransformInputContext = defaultTransformContext,
): Transferable.ObjectOutput => [
  "object",
  mapValues(props, (value, key) =>
    transformTransferableInput(value, {
      ...context,
      path: context.path.concat(key),
    }),
  ),
];

export const createCaller = (target: Transferable.Input) => {
  return function caller<Args extends Transferable.Input[]>(
    path: Transferable.FieldKey[],
    args: Args,
    _target = target,
    parent?: Transferable.Input,
  ) {
    if (path.length === 0) {
      if (!isTransferableInputOf.callable(_target)) {
        throw new Error(`No callable found at path: ${path}`);
      }

      return _target(...args);
    }

    if (isTransferableInputOf.object(_target)) {
      const [field] = path;
      const value = _target[field];
      return caller(path.slice(1), args, value);
    }

    if (isTransferableInputOf.array(_target)) {
      const [field] = path;
      const value = _target[field as number];
      return caller(path.slice(1), args, value);
    }
  };
};
