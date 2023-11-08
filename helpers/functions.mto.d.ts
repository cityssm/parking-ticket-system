export declare function twoDigitYearToFourDigit(twoDigitYear: number): number;
export declare function sixDigitDateNumberToEightDigit(sixDigitDateNumber: number): number;
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
export declare const importLicencePlateOwnership: (batchId: number, ownershipData: string, sessionUser: PTSUser) => ImportLicencePlateOwnershipResult;
export declare function exportLicencePlateBatch(batchId: number, sessionUser: PTSUser): string;
export {};
