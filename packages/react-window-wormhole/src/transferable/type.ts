export namespace Transferable {
  export type FieldKey = string | number;

  export namespace Inputs {
    export type Lossless = number | string | boolean | null | undefined;
    export type Callable<
      Args extends Input[] = Input[],
      R extends Input | void = void,
    > = (...args: Args) => R;

    export type Object = {
      [key: FieldKey]: Input;
    };
    export type Arr = Array<Input>;
  }

  export type Input =
    | Inputs.Lossless
    | Inputs.Object
    | Inputs.Arr
    | Inputs.Callable<any[], any>;

  export namespace Outputs {
    type __Output<K extends string, T> = [K, T];
    export type PayloadOf<T extends __Output<any, any>> =
      T extends __Output<infer K, infer V> ? V : never;

    export type Lossless = __Output<"lossless", Inputs.Lossless>;
    export type Callable = __Output<"callable", FieldKey[]>;
    export type Object = __Output<
      "object",
      {
        [key: FieldKey]: Output;
      }
    >;
    export type Arr = __Output<"array", Array<Output>>;
    export type Unknown = __Output<"unknown", null>;
  }

  export type Output =
    | Outputs.Lossless
    | Outputs.Callable
    | Outputs.Object
    | Outputs.Arr
    | Outputs.Unknown;
}
