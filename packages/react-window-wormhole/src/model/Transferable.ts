export type LosslessTransferable = number | string | boolean | null | undefined;
const isLosslessTransferable = (obj: any): obj is LosslessTransferable =>
  typeof obj === "number" || typeof obj === "string" || typeof obj === "boolean" || obj === null || obj === undefined;

export type CallableTransferable = Function;
const isCallableTransferable = (obj: any): obj is CallableTransferable => typeof obj === "function";

export type TransferableObject = {
  [key: string]: Transferable;
};
const isTransferableObject = (obj: any): obj is TransferableObject =>
  obj && typeof obj === "object" && !Array.isArray(obj);

type TransferableArray = Array<Transferable>;
const isTransferableArray = (obj: any): obj is TransferableArray => Array.isArray(obj) && obj.every(isTransferable);

export type Transferable = LosslessTransferable /* | CallableTransferable */ | TransferableObject | TransferableArray;
const isTransferable = (obj: any): obj is Transferable =>
  isLosslessTransferable(obj) || isTransferableObject(obj) || isTransferableArray(obj);

export const transformToTransferable = (value: unknown): Transferable => {
  if (isLosslessTransferable(value)) return value;
  if (isTransferableObject(value)) return transformToTransferableObject(value);
  if (isTransferableArray(value)) return value.map(transformToTransferable);
  console.warn(`[react-window-wormhole] Unsupported data type to transfer:`, value);
  return null;
};

export const transformToTransferableObject = (props: TransferableObject): TransferableObject =>
  Object.fromEntries(Object.entries(props).map(([key, value]) => [key, transformToTransferable(value)]));

export const resolveTransferable = (value: Transferable): Transferable => {
  if (isLosslessTransferable(value)) return value;
  if (isTransferableObject(value)) return resolveTransferableObject(value);
  if (isTransferableArray(value)) return value.map((v) => resolveTransferable(v));
  console.warn(`[react-window-wormhole] Unsupported data type to transfer:`, value);
  return null;
};

export const resolveTransferableObject = (props: TransferableObject): TransferableObject =>
  Object.fromEntries(Object.entries(props).map(([key, value]) => [key, resolveTransferable(value)]));
