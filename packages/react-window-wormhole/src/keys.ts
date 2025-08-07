export const keys = <T extends object>(o: T) => Object.keys(o) as (keyof T)[];
export const values = <T extends object>(o: T) => Object.values(o) as T[keyof T][];
export const mapValues = <T extends object, U>(
  obj: T,
  fn: (value: T[keyof T]) => U
): {
  [K in keyof T]: U;
} =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value)])) as {
    [K in keyof T]: U;
  };
