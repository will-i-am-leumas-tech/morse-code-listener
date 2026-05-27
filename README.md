# 🔊 Morse SDK

Lightweight Morse code SDK + CLI for Node.js.

Supports:

* Morse encoding/decoding
* keyboard-based Morse input
* realtime audio tones
* reusable SDK integration

---

# 📦 Installation

```bash
npm install node-global-key-listener speaker
```

---

# 📁 Structure

```bash
project/
├── sdk.js
├── cli.js
└── README.md
```

---

# 🚀 CLI Usage

Run the Morse CLI:

```bash
node cli.js
```

Controls:

```text
SPACE  = dot/dash
ENTER  = finish letter
TAB    = space
CTRL+C = quit
```

---

# 🧠 SDK Usage

## Import SDK

```js
import MorseSDK from "./sdk.js";
```

---

## Create Instance

```js
const morse = new MorseSDK();
```

---

# 🔤 Encode Text → Morse

```js
const code = morse.textToMorse("HELLO");

console.log(code);
```

Output:

```text
.... . .-.. .-.. ---
```

---

# 🔠 Decode Morse → Text

```js
const text = morse.morseToText(
  ".... . .-.. .-.. ---"
);

console.log(text);
```

Output:

```text
HELLO
```

---

# 🔊 Generate Morse Input Manually

```js
morse.inputDuration(100); // dot
morse.inputDuration(400); // dash

const letter = morse.finishLetter();

console.log(letter);
```

---

# 🧾 Get Current Message

```js
console.log(
  morse.getMessage()
);
```

---

# 🔄 Reset State

```js
morse.reset();
```

---

# ⚙️ Custom Configuration

```js
const morse = new MorseSDK({
  frequency: 900,
  unitMs: 120
});
```

---

# 🧩 Example Integration

```js
import MorseSDK from "./sdk.js";

const morse = new MorseSDK();

const encoded = morse.textToMorse("LEUMAS");

console.log(encoded);
```

---

# 📜 License

Leumas Technologies
