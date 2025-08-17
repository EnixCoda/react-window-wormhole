import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["esm"],
    environment: "happy-dom",
  },
});
