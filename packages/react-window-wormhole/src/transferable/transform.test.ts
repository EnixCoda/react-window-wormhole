import { describe, expect, it } from "vitest";
import { isTransferableOutputOf } from "./isOutput.js";
import { createCaller, transformTransferableInput } from "./transformInput.js";
import { transformTransferableOutput } from "./transformOutput.js";
import { Transferable } from "./type.js";

describe("TransferableData", () => {
  it("should handle lossless transferable types", () => {
    expect(transformTransferableInput(1)).toMatchInlineSnapshot(`
      [
        "lossless",
        1,
      ]
    `);
    expect(transformTransferableOutput(transformTransferableInput(1))).toEqual(
      1,
    );
    expect(transformTransferableInput("string")).toMatchInlineSnapshot(`
      [
        "lossless",
        "string",
      ]
    `);
    expect(
      transformTransferableOutput(transformTransferableInput("string")),
    ).toEqual("string");
    expect(transformTransferableInput(true)).toMatchInlineSnapshot(`
      [
        "lossless",
        true,
      ]
    `);
    expect(
      transformTransferableOutput(transformTransferableInput(true)),
    ).toEqual(true);
    expect(transformTransferableInput(null)).toMatchInlineSnapshot(`
      [
        "lossless",
        null,
      ]
    `);
    expect(
      transformTransferableOutput(transformTransferableInput(null)),
    ).toEqual(null);
    expect(transformTransferableInput(undefined)).toMatchInlineSnapshot(`
      [
        "lossless",
        undefined,
      ]
    `);
    expect(
      transformTransferableOutput(transformTransferableInput(undefined)),
    ).toEqual(undefined);
  });

  it("should handle transferable objects", () => {
    const input: Transferable.ObjectInput = { a: 1, b: "test", c: true };
    expect(transformTransferableInput(input)).toMatchInlineSnapshot(`
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

    expect(
      transformTransferableOutput(transformTransferableInput(input)),
    ).toEqual(input);
  });

  it("should handle transferable arrays", () => {
    const arr: Transferable.ArrayInput = [1, "test", true, null];
    expect(transformTransferableInput(arr)).toMatchInlineSnapshot(`
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
    expect(
      transformTransferableOutput(transformTransferableInput(arr)),
    ).toEqual(arr);
  });
});

describe("TransferableCallable", () => {
  it("should handle callable transferable", () => {
    let i = 0;
    const inc = (arg0: number) => (i += arg0);
    inc(2);
    expect(i).toBe(2);

    expect(transformTransferableInput(inc)).toMatchInlineSnapshot(`
      [
        "callable",
        [],
      ]
    `);

    const receivedInc = transformTransferableInput(inc);
    expect(transformTransferableOutput(receivedInc)).toEqual(
      expect.any(Function),
    );
    expect(isTransferableOutputOf.callable(receivedInc)).toBe(true);
    if (!isTransferableOutputOf.callable(receivedInc)) {
      throw new Error("Expected callable output");
    }
    const [_, path] = receivedInc;
    const caller = createCaller(inc);
    caller(path, [2]);
    expect(i).toBe(4);
  });
});
