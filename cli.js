#!/usr/bin/env node

import { GlobalKeyboardListener } from "node-global-key-listener";
import MorseSDK from "./sdk.js";

const morse = new MorseSDK();

let downAt = 0;

const listener = new GlobalKeyboardListener();

listener.addListener((e) => {

  // -----------------------------
  // SPACE → DOT / DASH
  // -----------------------------
  if (e.name === "SPACE") {

    if (e.state === "DOWN" && downAt === 0) {
      downAt = Date.now();
    }

    if (e.state === "UP" && downAt) {
      const held = Date.now() - downAt;

      downAt = 0;

      const symbol = morse.inputDuration(held);

      process.stdout.write(symbol);
    }
  }

  // -----------------------------
  // ENTER → FINISH LETTER
  // -----------------------------
  else if (
    e.name === "ENTER" ||
    e.name === "RETURN"
  ) {
    const letter = morse.finishLetter();

    process.stdout.write(letter);
  }

  // -----------------------------
  // TAB → WORD SPACE
  // -----------------------------
  else if (e.name === "TAB") {
    morse.addSpace();

    process.stdout.write(" ");
  }
});

console.log("🔊 Morse CLI:");
console.log("- SPACE: tap/hold for dot/dash");
console.log("- ENTER: finish letter");
console.log("- TAB: word space");
console.log("- Ctrl+C: quit\n");

process.on("SIGINT", () => {
  console.log("\nFinal message:");
  console.log(morse.getMessage());

  process.exit();
});