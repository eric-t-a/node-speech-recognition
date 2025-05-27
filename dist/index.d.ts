declare const MODELS_LIST: Record<string, string>;
export default function downloadModel(): Promise<void>;
export declare class Whisper {
    private model;
    constructor();
    init(modelName: keyof typeof MODELS_LIST): Promise<void>;
    private assertModel;
    transcribe(filePath: string, language?: string): Promise<any>;
    disposeModel(): Promise<void>;
}
export {};
