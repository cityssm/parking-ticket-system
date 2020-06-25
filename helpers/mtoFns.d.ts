/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
export declare const importLicencePlateOwnership: (batchID: number, ownershipData: string, reqSession: Express.Session) => {
    success: boolean;
    message: string;
    rowCount?: undefined;
    errorCount?: undefined;
    insertedErrorCount?: undefined;
    recordCount?: undefined;
    insertedRecordCount?: undefined;
} | {
    success: boolean;
    rowCount: number;
    errorCount: number;
    insertedErrorCount: number;
    recordCount: number;
    insertedRecordCount: number;
    message?: undefined;
};
export declare const exportLicencePlateBatch: (batchID: number, reqSession: Express.Session) => string;
export declare const exportConvictionBatch: (batchID: number, reqSession: Express.Session) => string;
