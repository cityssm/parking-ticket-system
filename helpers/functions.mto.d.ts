interface ImportLicencePlateOwnershipResult {
    success: boolean;
    message?: string;
    rowCount?: number;
    errorCount?: number;
    insertedErrorCount?: number;
    recordCount?: number;
    insertedRecordCount?: number;
}
export declare function importLicencePlateOwnership(batchId: number, ownershipData: string, sessionUser: PTSUser): Promise<ImportLicencePlateOwnershipResult>;
export declare function exportLicencePlateBatch(batchId: number, sessionUser: PTSUser): string;
export {};
