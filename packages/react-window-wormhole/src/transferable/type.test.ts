import { describe, expectTypeOf, it } from "vitest";
import { decodeTransferable } from "./decode.js";
import { encodeTransferable } from "./encode.js";
import { Transferable } from "./type.js";

describe("Transferred", () => {
  it("should handle lossless transferable types", () => {
    const original = 1;
    const transferred = decodeTransferable(encodeTransferable(original), {
      generateCallable(path) {
        throw 1;
      },
    }) as Transferable.Transferred<typeof original>;
    expectTypeOf(transferred).toExtend<1>();
  });

  it("should handle callable transferable types", () => {
    const original = (input: number) => input * 2;
    const transferred = decodeTransferable(encodeTransferable(original), {
      generateCallable: (path) => () => {},
    }) as Transferable.Transferred<typeof original>;
    expectTypeOf(transferred).toExtend<(input: number) => Promise<number>>();
  });
});
