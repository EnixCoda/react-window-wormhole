export namespace Transferable {
  export type FieldKey = string | number;

  export type __Lossless = number | string | boolean | null | undefined;

  export namespace Inputs {
    export type Lossless = __Lossless;
    /* Callable has to be async to ensure cross-context sync */
    export type Callable<
      Args extends Input[] = Input[],
      R extends Input | void | Promise<Input | void> = void,
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

  export namespace Decode {
    export type Lossless = __Lossless;
    /* Callable has to be async to ensure cross-context sync */
    export type Callable<
      Args extends Decoded[] = Decoded[],
      R extends Decoded | void = void,
    > = (...args: Args) => Promise<R>;

    export type Object = {
      [key: FieldKey]: Decoded;
    };
    export type Arr = Array<Decoded>;
  }

  export type Decoded =
    | Decode.Lossless
    | Decode.Object
    | Decode.Arr
    | Decode.Callable<any[], any>;

  export namespace Encode {
    type __Encode<K extends string, T> = [K, T];
    export type PayloadOf<T extends __Encode<any, any>> =
      T extends __Encode<infer K, infer V> ? V : never;

    export type Lossless = __Encode<"lossless", Inputs.Lossless>;
    export type Callable = __Encode<"callable", FieldKey[]>;
    export type Object = __Encode<
      "object",
      {
        [key: FieldKey]: Encoded;
      }
    >;
    export type Arr = __Encode<"array", Array<Encoded>>;
    export type Unknown = __Encode<"unknown", null>;
  }

  export type Encoded<I = any> =
    | Encode.Lossless
    | Encode.Callable
    | Encode.Object
    | Encode.Arr
    | Encode.Unknown;

  export type Transferred<I> = I extends Inputs.Lossless
    ? I
    : I extends Inputs.Object
      ? TransferredObj<I>
      : I extends Inputs.Arr
        ? TransferredArr<I>
        : I extends Inputs.Callable<infer Args, infer R>
          ? (...args: TransferredArr<Args>) => Promise<TransferredReturnType<R>>
          : never;

  type TransferredObj<O extends Inputs.Object> = {
    [key in keyof O]: Transferred<O[key]>;
  };

  type TransferredArr<Arr extends Inputs.Arr> = Arr extends []
    ? []
    : Arr extends [infer Arg, ...infer Rest]
      ? Rest extends Input[]
        ? [Transferred<Arg>, ...TransferredArr<Rest>]
        : never
      : never;

  type TransferredReturnType<R> =
    R extends Promise<infer U>
      ? Transferred<U>
      : R extends void
        ? void
        : R extends Input
          ? Transferred<R>
          : never;
}
