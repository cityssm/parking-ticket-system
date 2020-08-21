/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
export declare const clearConvictionBatch: (batchID: number, reqSession: Express.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
