import { describe, expect, it } from "vitest";
import { decodeTransferable, DecodeTransformContext } from "./decode.js";
import { createCaller, encodeTransferable } from "./encode.js";
import { isEncodedOf } from "./isEncoded.js";
import { Transferable } from "./type.js";

const defaultTransformContext: DecodeTransformContext = {
  generateCallable:
    (path) =>
    (...args) =>
      Promise.reject(
        new Error(
          `No callable context provided, using default callable that does nothing.`,
          {
            cause: { path, args },
          },
        ),
      ),
};

const _decodeTransferable = (encoded: Transferable.Encoded) =>
  decodeTransferable(encoded, defaultTransformContext);

describe("TransferableData", () => {
  it("should handle lossless transferable types", () => {
    expect(encodeTransferable(1)).toMatchInlineSnapshot(`
      [
        "lossless",
        1,
      ]
    `);

    expect(_decodeTransferable(encodeTransferable(1))).toEqual(1);
    expect(encodeTransferable("string")).toMatchInlineSnapshot(`
      [
        "lossless",
        "string",
      ]
    `);
    expect(_decodeTransferable(encodeTransferable("string"))).toEqual("string");
    expect(encodeTransferable(true)).toMatchInlineSnapshot(`
      [
        "lossless",
        true,
      ]
    `);
    expect(_decodeTransferable(encodeTransferable(true))).toEqual(true);
    expect(encodeTransferable(null)).toMatchInlineSnapshot(`
      [
        "lossless",
        null,
      ]
    `);
    expect(_decodeTransferable(encodeTransferable(null))).toEqual(null);
    expect(encodeTransferable(undefined)).toMatchInlineSnapshot(`
      [
        "lossless",
        undefined,
      ]
    `);
    expect(_decodeTransferable(encodeTransferable(undefined))).toEqual(
      undefined,
    );
  });

  it("should handle transferable objects", () => {
    const input: Transferable.Inputs.Object = { a: 1, b: "test", c: true };
    expect(encodeTransferable(input)).toMatchInlineSnapshot(`
      [
        "object",
        {
          "a": [
            "lossless",
            1,
          ],
          "b": [
            "lossless",
            "test",
          ],
          "c": [
            "lossless",
            true,
          ],
        },
      ]
    `);

    expect(_decodeTransferable(encodeTransferable(input))).toEqual(input);
  });

  it("should handle transferable arrays", () => {
    const arr: Transferable.Inputs.Arr = [1, "test", true, null];
    expect(encodeTransferable(arr)).toMatchInlineSnapshot(`
      [
        "array",
        [
          [
            "lossless",
            1,
          ],
          [
            "lossless",
            "test",
          ],
          [
            "lossless",
            true,
          ],
          [
            "lossless",
            null,
          ],
        ],
      ]
    `);
    expect(_decodeTransferable(encodeTransferable(arr))).toEqual(arr);
  });
});

describe("TransferableCallable", () => {
  it("should handle callable transferable", () => {
    let i = 0;
    const inc = (arg0: number) => (i += arg0);

    expect(encodeTransferable(inc)).toMatchInlineSnapshot(`
      [
        "callable",
        [],
      ]
    `);

    const returnValue = inc(2);
    expect(returnValue).toBe(2);
    expect(i).toBe(2);

    const intEncoded = encodeTransferable(inc);
    const intDecoded = _decodeTransferable(intEncoded);
    expect(intDecoded).toEqual(expect.any(Function));

    if (!isEncodedOf.callable(intEncoded)) {
      throw new Error("Expected callable encoded");
    }

    {
      const [_, path] = intEncoded;
      const caller = createCaller(inc);
      const returnValue = caller(path, [2]);
      expect(returnValue).toBe(4);
      expect(i).toBe(4);
    }
  });
});
