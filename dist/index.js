"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Whisper = void 0;
const wavefile_1 = require("wavefile");
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const transformers_1 = require("@huggingface/transformers");
const shelljs_1 = __importDefault(require("shelljs"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const path_1 = __importDefault(require("path"));
const DEFAULT_MODEL = "base.en";
const NODE_MODULES_MODELS_PATH = "node_modules/node-speech-recognition/whisper-models";
const MODELS_LIST = {
    "tiny": "whisper-tiny",
    "tiny.en": "whisper-tiny.en",
    "base": "whisper-base",
    "base.en": "whisper-base.en",
    "small": "whisper-small",
    "small.en": "whisper-small.en",
    "medium": "whisper-medium",
    "medium.en": "whisper-medium.en"
};
const MODEL_FILES = [
    "added_tokens.json",
    "config.json",
    "generation_config.json",
    "merges.txt",
    "normalizer.json",
    "preprocessor_config.json",
    "quant_config.json",
    "special_tokens_map.json",
    "tokenizer.json",
    "tokenizer_config.json",
    "vocab.json",
    "onnx/encoder_model.onnx",
    "onnx/decoder_model_merged.onnx"
];
transformers_1.env.localModelPath = NODE_MODULES_MODELS_PATH;
transformers_1.env.backends.onnx.logSeverityLevel = 4;
transformers_1.env.backends.onnx.graphOptimizationLevel = 'disabled';
const readFile = util_1.default.promisify(fs_1.default.readFile);
const modelPromise = (modelName) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!MODELS_LIST[modelName])
                throw `modelName "${modelName}" not found in list of models.\n`;
            if (!fs_1.default.existsSync(`${NODE_MODULES_MODELS_PATH}/${MODELS_LIST[modelName]}`)) {
                console.log(`\n' Model ${modelName}' not downloaded!`);
                yield downloadModel();
            }
            // @ts-ignore
            resolve(yield (0, transformers_1.pipeline)("automatic-speech-recognition", MODELS_LIST[modelName], { quantized: false }));
        }
        catch (err) {
            reject(err);
        }
    }));
};
// format audio to .wav 16Khz
const prepareAudio = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const wav = new wavefile_1.WaveFile(yield readFile(path_1.default.normalize(filePath)));
    wav.toBitDepth('32f');
    wav.toSampleRate(16000);
    let audioData = wav.getSamples();
    if (Array.isArray(audioData)) {
        if (audioData.length > 1) {
            const SCALING_FACTOR = Math.sqrt(2);
            for (let i = 0; i < audioData[0].length; ++i) {
                audioData[0][i] = SCALING_FACTOR * (audioData[0][i] + audioData[1][i]) / 2;
            }
        }
        audioData = audioData[0];
    }
    return audioData;
});
const askModel = () => {
    const answer = readline_sync_1.default.question(`\nEnter a model name (e.g. 'base.en') to download it or 'cancel' to exit\n(ENTER for base.en): `);
    if (answer === "cancel") {
        console.log("Exiting model downloader");
        process.exit(0);
    }
    else if (answer === "") {
        console.log("Going with", DEFAULT_MODEL);
        return DEFAULT_MODEL;
    }
    else if (!MODELS_LIST[answer]) {
        console.log("\nFAIL: Name not found.");
        return askModel();
    }
    return answer;
};
function downloadModel() {
    return __awaiter(this, void 0, void 0, function* () {
        const src = "https://huggingface.co/Xenova";
        const pfx = "resolve/main";
        try {
            console.log(`
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
        `);
            const modelName = yield askModel();
            if (!!shelljs_1.default.which("wget")) {
                MODEL_FILES.forEach(fileName => {
                    shelljs_1.default.exec(`wget --quiet --show-progress -P ./${NODE_MODULES_MODELS_PATH}/${MODELS_LIST[modelName]}/${path_1.default.dirname(fileName)} ${src}/${MODELS_LIST[modelName]}/${pfx}/${fileName}`);
                });
            }
            else if (!!shelljs_1.default.which("curl")) {
                MODEL_FILES.forEach(fileName => {
                    shelljs_1.default.exec(`curl -L ${src}/${MODELS_LIST[modelName]}/${pfx}/${fileName} -o ${NODE_MODULES_MODELS_PATH}/${MODELS_LIST[modelName]}/${fileName} --create-dirs`);
                });
            }
            else {
                console.log("Either wget or curl is required to download models.");
            }
        }
        catch (error) {
            console.log("ERROR Caught in download model");
            console.log(error);
            process.exit(0);
        }
    });
}
exports.default = downloadModel;
class Whisper {
    constructor() {
    }
    init(modelName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.assertModel(modelName);
        });
    }
    assertModel(modelName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!modelName)
                console.log("No 'modelName' provided. Trying default model:", DEFAULT_MODEL, "\n");
            this.model = yield modelPromise(modelName || DEFAULT_MODEL);
        });
    }
    transcribe(filePath, language) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.model) {
                console.log("ERROR: Model not initialized. You should use `await whisper.init('base.en')` before calling `.transcribe()`");
                return;
            }
            try {
                const audioData = yield prepareAudio(filePath);
                const lang = language ? { language } : {};
                return this.model(audioData, Object.assign({ chunk_length_s: 30, stride_length_s: 5, return_timestamps: true }, lang));
            }
            catch (error) {
                console.log("Transcribe error:", error);
            }
        });
    }
    disposeModel() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.dispose();
        });
    }
}
exports.Whisper = Whisper;
