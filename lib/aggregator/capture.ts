import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { leakCheck, synthesize } from "../fixtures/synthesize";

/**
 * Writes the raw provider payload to a gitignored directory, then generates a
 * committable fixture from it and refuses to write that fixture unless the leak
 * check passes (spec 0001 AC-6 and AC-9).
 *
 * Provider neutral on purpose: it takes an opaque payload and a label, so
 * nothing here knows which aggregator produced it.
 */

const CAPTURE_DIR = path.join(process.cwd(), "captures");
const FIXTURE_DIR = path.join(process.cwd(), "fixtures");

export interface CaptureReport {
  label: string;
  rawPath: string;
  fixturePath: string | null;
  leakCheckPassed: boolean;
  violations: string[];
}

export async function capture(label: string, payload: unknown): Promise<CaptureReport> {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeLabel = label.replace(/[^a-z0-9-]/gi, "-").toLowerCase();

  await mkdir(CAPTURE_DIR, { recursive: true });
  const rawPath = path.join(CAPTURE_DIR, `${safeLabel}-${stamp}.json`);
  await writeFile(rawPath, JSON.stringify(payload, null, 2), "utf8");

  const { fixture, notes } = synthesize(payload);
  const report = leakCheck(payload, fixture);

  if (!report.passed) {
    // Refuse to write. A fixture that half worked is worse than none, because
    // it looks safe.
    return {
      label: safeLabel,
      rawPath,
      fixturePath: null,
      leakCheckPassed: false,
      violations: report.violations.slice(0, 10),
    };
  }

  await mkdir(FIXTURE_DIR, { recursive: true });
  const fixturePath = path.join(FIXTURE_DIR, `${safeLabel}.json`);
  await writeFile(
    fixturePath,
    JSON.stringify(
      {
        _generated: "Synthetic. Values are generated, never copied. See lib/fixtures/synthesize.ts.",
        _transform: notes,
        data: fixture,
      },
      null,
      2,
    ),
    "utf8",
  );

  return {
    label: safeLabel,
    rawPath,
    fixturePath,
    leakCheckPassed: true,
    violations: [],
  };
}
