import type * as expressSession from "express-session";
export declare const twoDigitYearToFourDigit: (twoDigitYear: number) => number;
export declare const sixDigitDateNumberToEightDigit: (sixDigitDateNumber: number) => number;
interface PKRDResult {
    licencePlateNumber: string;
    issueDate: number;
    ticketNumber: string;
    driverLicenceNumber: string;
    ownerGenderKey: string;
    ownerName1: string;
    ownerName2: string;
    ownerAddress: string;
    ownerCity: string;
    ownerProvince: string;
    ownerPostalCode: string;
    vehicleNCIC: string;
    vehicleYear: number;
    vehicleColor: string;
    errorCode: string;
    errorMessage: string;
    licencePlateExpiryDate: number;
}
export declare const parsePKRD: (rowData: string) => false | PKRDResult;
interface ImportLicencePlateOwnershipResult {
    success: boolean;
    message?: string;
    rowCount?: number;
    errorCount?: number;
    insertedErrorCount?: number;
    recordCount?: number;
    insertedRecordCount?: number;
}
export declare const importLicencePlateOwnership: (batchID: number, ownershipData: string, requestSession: expressSession.Session) => ImportLicencePlateOwnershipResult;
export declare const exportLicencePlateBatch: (batchID: number, requestSession: expressSession.Session) => string;
export declare const exportConvictionBatch: (batchID: number, requestSession: expressSession.Session) => string;
export {};
