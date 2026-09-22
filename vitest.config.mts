import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // Match the tsconfig "@/*": ["./*"] path alias so tests import the same
      // way app code does.
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // Stub the server-only guard to a no-op so mapping logic can be unit tested.
      // The guard exists to fail a build if server code is imported into the
      // client bundle; it is not relevant in a test runner.
      "server-only": fileURLToPath(new URL("./test/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
