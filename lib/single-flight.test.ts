import { describe, expect, it } from "vitest";

import { createSingleFlight } from "./single-flight";

describe("createSingleFlight", () => {
  it("shares one in-flight operation across simultaneous callers", async () => {
    let callCount = 0;
    let completeOperation: ((value: string) => void) | undefined;
    const operation = () => {
      callCount += 1;
      return new Promise<string>((resolve) => {
        completeOperation = resolve;
      });
    };
    const run = createSingleFlight(operation);

    const first = run();
    const second = run();
    await Promise.resolve();

    expect(first).toBe(second);
    expect(callCount).toBe(1);

    completeOperation?.("new-token");
    await expect(Promise.all([first, second])).resolves.toEqual([
      "new-token",
      "new-token",
    ]);
  });

  it("allows a later retry after the shared operation fails", async () => {
    let callCount = 0;
    const run = createSingleFlight(async () => {
      callCount += 1;
      if (callCount === 1) throw new Error("temporary network failure");
      return "recovered";
    });

    await expect(run()).rejects.toThrow("temporary network failure");
    await expect(run()).resolves.toBe("recovered");
    expect(callCount).toBe(2);
  });
});
