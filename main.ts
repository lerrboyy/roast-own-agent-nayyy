// Roast Your Own Agent — entry program.
//
// Writes one single-line roast of our own agent to /output/entry.txt,
// validates it against the competition gate (UTF-8 text, 1-200 chars,
// not only whitespace, one line), then reads it back and verifies the
// bytes on disk match exactly what was written.
//
// The roast: our agent keeps a 240-line lessons-learned.md recording
// every make.fun rejection — and has never once applied a single line
// of it. The joke is the gap between the file that exists and the
// file that doesn't.

import { createHash } from "node:crypto";
import {
  mkdirSync,
  openSync,
  closeSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = "/output";
const OUTPUT_FILE = join(OUTPUT_DIR, "entry.txt");

// The entry. One line, no trailing newline in the file.
const ROAST =
  "My agent keeps a 240-line file called lessons-learned.md \u2014 and a 0-line file called lessons-applied.md.";

const MAX_CHARS = 200;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function validate(text: string): void {
  // Gate: 1-200 characters (counted as Unicode code points, like the
  // scorer's character count, not UTF-16 code units).
  const charCount = [...text].length;
  if (charCount < 1 || charCount > MAX_CHARS) {
    fail(`roast is ${charCount} characters, must be 1-${MAX_CHARS}`);
  }
  // Gate: not only whitespace.
  if (text.trim().length === 0) {
    fail("roast is only whitespace");
  }
  // One line: no newline or carriage return anywhere.
  if (text.includes("\n") || text.includes("\r")) {
    fail("roast must be a single line");
  }
  // No leading or trailing whitespace — every word earns its place.
  if (text !== text.trim()) {
    fail("roast has leading or trailing whitespace");
  }
  // No control characters: a roast is printable text, and a stray
  // control byte would fail the gate or confuse the judge.
  for (const ch of text) {
    if (ch.codePointAt(0)! < 0x20 || ch.codePointAt(0) === 0x7f) {
      fail(`roast contains a control character (U+${ch.codePointAt(0)!.toString(16).padStart(4, "0")})`);
    }
  }
  // Valid UTF-8 round-trip: encoding then decoding must be identical.
  const encoded = new TextEncoder().encode(text);
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(encoded);
  if (decoded !== text) {
    fail("roast is not valid UTF-8");
  }
}

function clearOutputDirContents(dir: string): void {
  // Clear ONLY the contents of the output directory. Never remove the
  // directory itself: the grader's /output is a mount point and
  // removing it fails the run (EBUSY).
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function main(): void {
  validate(ROAST);

  clearOutputDirContents(OUTPUT_DIR);

  const bytes = new TextEncoder().encode(ROAST);
  writeFileSync(OUTPUT_FILE, bytes);

  // Read back twice through independent paths and verify byte-for-byte:
  // once with readFileSync, once with a fresh file descriptor, and
  // compare the SHA-256 of what was written against what was read.
  const writtenHash = createHash("sha256").update(bytes).digest("hex");
  const readBack = readFileSync(OUTPUT_FILE);
  if (!readBack.equals(bytes)) {
    fail("read-back mismatch: entry.txt on disk differs from the roast");
  }
  const fd = openSync(OUTPUT_FILE, "r");
  try {
    const secondRead = readFileSync(fd);
    if (!secondRead.equals(bytes)) {
      fail("second read-back mismatch: entry.txt differs on a fresh descriptor");
    }
    const readHash = createHash("sha256").update(secondRead).digest("hex");
    if (readHash !== writtenHash) {
      fail(`sha256 mismatch: wrote ${writtenHash}, read ${readHash}`);
    }
  } finally {
    closeSync(fd);
  }
  const readBackText = new TextDecoder("utf-8", { fatal: true }).decode(readBack);
  if (readBackText !== ROAST) {
    fail("read-back mismatch: decoded entry.txt differs from the roast");
  }

  console.log(
    `wrote ${OUTPUT_FILE}: ${[...ROAST].length} chars, ${bytes.length} bytes, sha256 ${writtenHash.slice(0, 16)}…, verified byte-for-byte`,
  );
  console.log(ROAST);
}

main();
