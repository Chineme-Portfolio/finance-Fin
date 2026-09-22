import { describe, it, expect } from "vitest";
import { formatMoney, formatBps, minorToMajorNumber } from "./format";

describe("format helpers (spec 0003)", () => {
  it("formatMoney rounds minor units to whole dollars, no decimals [AC-3]", () => {
    expect(formatMoney(521555)).toBe("$5,216"); // $5,215.55 -> rounded
    expect(formatMoney(1565855)).toBe("$15,659"); // $15,658.55 -> rounded
  });

  it("formatMoney handles zero without a blank or NaN [AC-5]", () => {
    expect(formatMoney(0)).toBe("$0");
  });

  it("formatBps renders integer basis points as a percent [AC-10]", () => {
    expect(formatBps(6600)).toBe("66%");
    expect(formatBps(3400)).toBe("34%");
    expect(formatBps(0)).toBe("0%");
    expect(formatBps(10000)).toBe("100%");
  });

  it("minorToMajorNumber converts cents to a major-unit number [AC-3]", () => {
    expect(minorToMajorNumber(1565900)).toBe(15659);
    expect(minorToMajorNumber(0)).toBe(0);
  });
});
