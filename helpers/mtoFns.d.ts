/// <reference types="express-session" />
export declare function importLicencePlateOwnership(batchID: number, ownershipData: string, reqSession: Express.Session): {
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
export declare function exportLicencePlateBatch(batchID: number, reqSession: Express.Session): string;
export declare function exportConvictionBatch(batchID: number, reqSession: Express.Session): string;
