/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
export declare const lockConvictionBatch: (batchID: number, reqSession: Express.Session) => {
    success: boolean;
    lockDate: number;
    lockDateString: string;
};
