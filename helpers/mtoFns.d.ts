/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
export declare const twoDigitYearToFourDigit: (twoDigitYear: number) => number;
export declare const sixDigitDateNumberToEightDigit: (sixDigitDateNumber: number) => number;
export declare const parsePKRD: (rowData: string) => false | {
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
};
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
