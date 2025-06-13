declare const MODELS_LIST: Record<string, string>;
export default class Whisper {
    private model;
    constructor();
    init(modelName: keyof typeof MODELS_LIST): Promise<void>;
    private assertModel;
    transcribe(filePath: string, language?: string): Promise<any>;
    disposeModel(): Promise<void>;
}
export {};
