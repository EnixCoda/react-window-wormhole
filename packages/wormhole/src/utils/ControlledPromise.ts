export interface ControlledPromise<T = unknown> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

export const createControlledPromise = <
  T = unknown,
>(): ControlledPromise<T> => {
  let _resolve: ControlledPromise<T>["resolve"];
  let _reject: ControlledPromise<T>["reject"];

  const promise = new Promise<T>((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  });

  if (!_resolve! || !_reject!) {
    throw new Error("Failed to create controlled promise");
  }

  return {
    promise,
    resolve: _resolve,
    reject: _reject,
  };
};
