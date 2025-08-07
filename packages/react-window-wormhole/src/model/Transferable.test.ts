import { describe, expect, it } from "vitest";
import { resolveTransferable, transformToTransferable } from "./Transferable.js";

describe("Transferable", () => {
  it("should handle lossless transferable types", () => {
    expect(resolveTransferable(transformToTransferable(1))).toBe(1);
    expect(resolveTransferable(transformToTransferable("string"))).toBe("string");
    expect(resolveTransferable(transformToTransferable(true))).toBe(true);
    expect(resolveTransferable(transformToTransferable(null))).toBeNull();
    expect(resolveTransferable(transformToTransferable(undefined))).toBeUndefined();
  });

  it("should handle transferable objects", () => {
    const obj = { a: 1, b: "test", c: true };
    const transformed = transformToTransferable(obj);
    expect(transformed).toEqual(obj);
    expect(resolveTransferable(transformed)).toEqual(obj);
  });

  it("should handle transferable arrays", () => {
    const arr = [1, "test", true, null];
    const transformed = transformToTransferable(arr);
    expect(transformed).toEqual(arr);
    expect(resolveTransferable(transformed)).toEqual(arr);
  });
});
