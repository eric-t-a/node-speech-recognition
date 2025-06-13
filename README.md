# node-speech-recognition

[![npm downloads](https://img.shields.io/npm/dm/node-speech-recognition)](https://npmjs.org/package/node-speech-recognition)
[![npm downloads](https://img.shields.io/npm/l/node-speech-recognition)](https://npmjs.org/package/node-speech-recognition)  

Transcribe speech to text on node.js using OpenAI's Whisper models converted to cross-platform ONNX format

## Installation

1. Add dependency to project

```text
npm i node-speech-recognition
```

## Usage

```js
import Whisper from "node-speech-recognition";

const whisper = new Whisper();
await whisper.init('base.en')

const transcribed = await whisper.transcribe('your/audio/path.wav');

console.log(transcribed)
```

### Result (JSON)

```javascript
[
  {
    text: " And so my fellow Americans ask not what your country can do for you, ask what you can do for your country."
    chunks: [
       { timestamp: [0, 8.18],  text: " And so my fellow Americans ask not what your country can do for you" },
       { timestamp: [8.18, 11.06], text: " ask what you can do for your country." }
    ]
  }
]
```

## API

### Whisper

The `Whisper` class has the following methods:

- `init(modelName: string)` : you must initialize it before trying to transcribe any audio.
  - `modelName`: name of the Whisper's models. Available ones are:
  
            | Model     | Disk   |
            |-----------|--------|
            | tiny      | 235 MB |
            | tiny.en   | 235 MB |
            | base      | 400 MB |
            | base.en   | 400 MB |
            | small     | 1.1 GB |
            | small.en  | 1.1 GB |
            | medium    | 1.2 GB |
            | medium.en | 1.2 GB |
        
- `transcribe(filePath: string, language?: string)` : transcribes speech from wav file.
  - `filePath`: path to wav file
  - `language`: target language for recognition. Name format - the full name in English like `'spanish'`
- `disposeModel()` : dispose initialized model.

## Made with

- [Transformers.js](https://www.npmjs.com/package/@huggingface/transformers)
- [ShellJS](https://www.npmjs.com/package/shelljs)