#!/usr/bin/env node
import { GlobalKeyboardListener } from 'node-global-key-listener';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Speaker = require('speaker');

// — Audio settings —
const SAMPLE_RATE = 44100; // samples/sec
const FREQUENCY   = 750;   // Hz tone
const BIT_DEPTH   = 16;    // bits per sample
const CHANNELS    = 1;     // mono
const UNIT_MS     = 150;   // dot=1 unit; dash=3 units

// Morse lookup
const MORSE_CODE_MAP = {
  '.-':'A','-...':'B','-.-.':'C','-..':'D','.':'E','..-.':'F','--.':'G','....':'H',
  '..':'I','.---':'J','-.-':'K','.-..':'L','--':'M','-.':'N','---':'O','.--.':'P',
  '--.-':'Q','.-.':'R','...':'S','-':'T','..-':'U','...-':'V','.--':'W','-..-':'X',
  '-.--':'Y','--..':'Z',
  '-----':'0','.----':'1','..---':'2','...--':'3','....-':'4','.....':'5','-....':'6',
  '--...':'7','---..':'8','----.':'9'
};

// one speaker instance
const speaker = new Speaker({ channels: CHANNELS, bitDepth: BIT_DEPTH, sampleRate: SAMPLE_RATE });
function playBeep(ms) {
  const samples = Math.floor(SAMPLE_RATE * ms/1000);
  const buf     = Buffer.alloc(samples * 2);
  for (let i = 0; i < samples; i++) {
    const v = Math.sin(2 * Math.PI * FREQUENCY * (i/SAMPLE_RATE));
    buf.writeInt16LE(Math.floor(v * 0x7FFF), i*2);
  }
  speaker.write(buf);
}

let downAt = 0;
let currentSymbolBuffer = [];
let messageBuffer       = [];

const listener = new GlobalKeyboardListener();
listener.addListener(e => {
  // 1) Dot/Dash on SPACE
  if (e.name === 'SPACE') {
    if (e.state === 'DOWN' && downAt === 0) {
      downAt = Date.now();
    }
    if (e.state === 'UP' && downAt) {
      const held = Date.now() - downAt;
      downAt = 0;

      const isDash = held > UNIT_MS;
      const sym    = isDash ? '–' : '.';
      currentSymbolBuffer.push(sym);
      process.stdout.write(sym);
      playBeep(isDash ? UNIT_MS*3 : UNIT_MS);
    }
  }

  // 2) Letter boundary on ENTER/RETURN (any state)
  else if (e.name === 'ENTER' || e.name === 'RETURN') {
    const code = currentSymbolBuffer.join('');
    const letter = MORSE_CODE_MAP[code] || '?';
    messageBuffer.push(letter);
    process.stdout.write(letter);
    currentSymbolBuffer = [];
  }

  // 3) Word boundary on TAB (any state)
  else if (e.name === 'TAB') {
    messageBuffer.push(' ');
    process.stdout.write(' ');
  }
});

console.log('🔊 Morse CLI:');
console.log('- SPACE: tap/hold to build “.” or “–”');
console.log('- ENTER/RETURN: finish letter (decoded)');
console.log('- TAB: insert word-space');
console.log('- Ctrl+C: quit\n');

process.on('SIGINT', () => {
  console.log('\nFinal message:', messageBuffer.join(''));
  process.exit();
});
