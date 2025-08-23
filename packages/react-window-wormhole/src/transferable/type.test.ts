import { describe, expectTypeOf, it } from "vitest";
import { decodeTransferable } from "./decode.js";
import { encodeTransferable } from "./encode.js";

describe("Transferred", () => {
  it("should handle lossless transferable types", () => {
    const input = 1;
    const transferred = decodeTransferable(encodeTransferable(input), {
      generateCallable: () => () => Promise.reject(),
    });
    expectTypeOf(transferred).toExtend<number>();
  });

  it("should handle callable transferable types", () => {
    const input = (num: number) => num * 2;
    const transferred = decodeTransferable(encodeTransferable(input), {
      generateCallable: () => () => Promise.reject(),
    });

    expectTypeOf(transferred).toExtend<(input: number) => Promise<number>>();
  });

  it("should handle callable transferable types in object", () => {
    const input = {
      method: (num: number) => num * 2,
    };
    const transferred = decodeTransferable(encodeTransferable(input), {
      generateCallable: () => () => Promise.reject(),
    });
    expectTypeOf(transferred).toExtend<{
      method: (input: number) => Promise<number>;
    }>();
  });
});
