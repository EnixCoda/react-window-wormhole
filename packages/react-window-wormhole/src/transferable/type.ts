export namespace Transferable {
  export type LosslessInput = number | string | boolean | null | undefined;

  export type CallableInput<
    Args extends Input[] = Input[],
    R extends Input | void = void,
  > = (...args: Args) => R;

  export type FieldKey = string | number;

  export type ObjectInput = {
    [key: FieldKey]: Input;
  };
  export type ArrayInput = Array<Input>;
  export type Input =
    | LosslessInput
    | ObjectInput
    | ArrayInput
    | CallableInput<any[], any>;

  type __Output<K extends string, T> = [K, T];
  export type LosslessOutput = __Output<"lossless", LosslessInput>;
  export type CallableOutput = __Output<"callable", FieldKey[]>;
  export type ObjectOutput = __Output<
    "object",
    {
      [key: FieldKey]: Output;
    }
  >;
  export type ArrayOutput = __Output<"array", Array<Output>>;
  export type UnknownOutput = __Output<"unknown", null>;
  export type Output =
    | LosslessOutput
    | CallableOutput
    | ObjectOutput
    | ArrayOutput
    | UnknownOutput;
}
