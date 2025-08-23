import { describe, expect, it } from "vitest";
import { createControlledPromise } from "./ControlledPromise.js";

describe("createThread", () => {
  it("should resolve with a Thread object containing resolve and reject functions", () => {
    const cp = createControlledPromise<number>();
    expect(cp).toHaveProperty("resolve");
    expect(cp).toHaveProperty("reject");
    expect(typeof cp.resolve).toBe("function");
    expect(typeof cp.reject).toBe("function");
  });

  it("should resolve the promise when resolve is called", () => {
    const cp = createControlledPromise<number>();

    cp.resolve(42);

    expect(cp.promise).resolves.toBe(42);
  });

  it("should reject the promise when reject is called", () => {
    const thread = createControlledPromise<number>();

    thread.reject("error");

    expect(thread.promise).rejects.toBe("error");
  });

  it("should work with default generic type", () => {
    const thread = createControlledPromise();
    expect(thread).toHaveProperty("resolve");
    expect(thread).toHaveProperty("reject");
  });
});
