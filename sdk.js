import { createRequire } from "module";
const require = createRequire(import.meta.url);

const Speaker = require("speaker");

// -----------------------------------
// DEFAULT SETTINGS
// -----------------------------------
const DEFAULTS = {
  sampleRate: 44100,
  frequency: 750,
  bitDepth: 16,
  channels: 1,
  unitMs: 150,
};

// -----------------------------------
// MORSE MAP
// -----------------------------------
const MORSE_CODE_MAP = {
  '.-':'A','-...':'B','-.-.':'C','-..':'D','.':'E','..-.':'F','--.':'G','....':'H',
  '..':'I','.---':'J','-.-':'K','.-..':'L','--':'M','-.':'N','---':'O','.--.':'P',
  '--.-':'Q','.-.':'R','...':'S','-':'T','..-':'U','...-':'V','.--':'W','-..-':'X',
  '-.--':'Y','--..':'Z',
  '-----':'0','.----':'1','..---':'2','...--':'3','....-':'4','.....':'5','-....':'6',
  '--...':'7','---..':'8','----.':'9'
};

// reverse map
const TEXT_TO_MORSE = Object.fromEntries(
  Object.entries(MORSE_CODE_MAP).map(([k, v]) => [v, k])
);

export class MorseSDK {
  constructor(options = {}) {
    this.config = {
      ...DEFAULTS,
      ...options
    };

    this.currentSymbolBuffer = [];
    this.messageBuffer = [];

    this.speaker = new Speaker({
      channels: this.config.channels,
      bitDepth: this.config.bitDepth,
      sampleRate: this.config.sampleRate
    });
  }

  // -----------------------------------
  // PLAY AUDIO TONE
  // -----------------------------------
  playBeep(ms) {
    const samples = Math.floor(
      this.config.sampleRate * ms / 1000
    );

    const buf = Buffer.alloc(samples * 2);

    for (let i = 0; i < samples; i++) {
      const v = Math.sin(
        2 * Math.PI *
        this.config.frequency *
        (i / this.config.sampleRate)
      );

      buf.writeInt16LE(
        Math.floor(v * 0x7FFF),
        i * 2
      );
    }

    this.speaker.write(buf);
  }

  // -----------------------------------
  // DOT OR DASH
  // -----------------------------------
  inputDuration(ms) {
    const isDash = ms > this.config.unitMs;

    const symbol = isDash ? "-" : ".";

    this.currentSymbolBuffer.push(symbol);

    this.playBeep(
      isDash
        ? this.config.unitMs * 3
        : this.config.unitMs
    );

    return symbol;
  }

  // -----------------------------------
  // FINISH LETTER
  // -----------------------------------
  finishLetter() {
    const code = this.currentSymbolBuffer.join("");

    const letter = MORSE_CODE_MAP[code] || "?";

    this.messageBuffer.push(letter);

    this.currentSymbolBuffer = [];

    return letter;
  }

  // -----------------------------------
  // WORD BREAK
  // -----------------------------------
  addSpace() {
    this.messageBuffer.push(" ");
  }

  // -----------------------------------
  // GET MESSAGE
  // -----------------------------------
  getMessage() {
    return this.messageBuffer.join("");
  }

  // -----------------------------------
  // ENCODE TEXT → MORSE
  // -----------------------------------
  textToMorse(text = "") {
    return text
      .toUpperCase()
      .split("")
      .map(char => {
        if (char === " ") return "/";

        return TEXT_TO_MORSE[char] || "?";
      })
      .join(" ");
  }

  // -----------------------------------
  // DECODE MORSE → TEXT
  // -----------------------------------
  morseToText(morse = "") {
    return morse
      .split(" ")
      .map(code => {
        if (code === "/") return " ";

        return MORSE_CODE_MAP[code] || "?";
      })
      .join("");
  }

  // -----------------------------------
  // RESET STATE
  // -----------------------------------
  reset() {
    this.currentSymbolBuffer = [];
    this.messageBuffer = [];
  }
}

export default MorseSDK;