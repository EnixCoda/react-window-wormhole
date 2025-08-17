export namespace Transferable {
  export type FieldKey = string | number;

  export namespace Decode {
    export type Lossless = number | string | boolean | null | undefined;
    export type Callable<
      Args extends Decoded[] = Decoded[],
      R extends Decoded | void = void,
    > = (...args: Args) => R;

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

    export type Lossless = __Encode<"lossless", Decode.Lossless>;
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

  export type Encoded =
    | Encode.Lossless
    | Encode.Callable
    | Encode.Object
    | Encode.Arr
    | Encode.Unknown;
}
