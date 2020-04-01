import sqlite = require("better-sqlite3");
export declare type Config = {
    application?: Config_ApplicationConfig;
    session?: Config_SessionConfig;
    admin?: Config_AdminDefaults;
    defaults?: Config_DefaultsConfig;
    locationClasses?: Config_LocationClass[];
    parkingTickets?: Config_ParkingTickets;
    parkingTicketStatuses?: Config_ParkingTicketStatus[];
    genders?: Config_Gender[];
    licencePlateCountryAliases?: {
        [countryKey: string]: string;
    };
    licencePlateProvinceAliases?: {
        [country: string]: {
            [provinceKey: string]: string;
        };
    };
    licencePlateProvinces?: {
        [country: string]: Config_LicencePlateCountry;
    };
    mtoExportImport?: Config_MTOExportImport;
};
declare type Config_ApplicationConfig = {
    applicationName?: string;
    logoURL?: string;
    httpPort?: number;
    https?: Config_HttpsConfig;
    feature_mtoExportImport?: boolean;
    task_nhtsa?: Config_ApplicationTask;
};
export declare type Config_ApplicationTask = {
    runTask: boolean;
    executeHour: number;
};
export declare type Config_HttpsConfig = {
    port: number;
    keyPath: string;
    certPath: string;
    passphrase: string;
};
declare type Config_SessionConfig = {
    cookieName: string;
    secret: string;
    maxAgeMillis: number;
};
declare type Config_AdminDefaults = {
    defaultPassword?: string;
};
declare type Config_DefaultsConfig = {
    province: string;
    country: string;
};
export declare type Config_LocationClass = {
    locationClassKey: string;
    locationClass: string;
};
declare type Config_ParkingTickets = {
    ticketNumber: {
        fieldLabel?: string;
        pattern?: RegExp;
        isUnique?: boolean;
        nextTicketNumberFn?: (currentTicketNumber: string) => string;
    };
};
export declare type Config_ParkingTicketStatus = {
    statusKey: string;
    status: string;
    statusField?: {
        fieldLabel: string;
    };
    isFinalStatus: boolean;
    isUserSettable: boolean;
};
declare type Config_LicencePlateCountry = {
    countryShortName: string;
    provinces: {
        [province: string]: Config_LicencePlateProvince;
    };
};
declare type Config_LicencePlateProvince = {
    provinceShortName: string;
    color: string;
    backgroundColor: string;
};
declare type Config_Gender = {
    genderKey: string;
    gender: string;
};
declare type Config_MTOExportImport = {
    authorizedUser?: string;
};
export declare type RawRowsColumnsReturn = {
    rows: object[];
    columns: sqlite.ColumnDefinition[];
};
export declare type Record = {
    recordType: "ticket" | "remark" | "status" | "owner";
    recordCreate_userName?: string;
    recordCreate_timeMillis?: number;
    recordUpdate_userName?: string;
    recordUpdate_timeMillis?: number;
    recordUpdate_dateString?: string;
    recordDelete_userName?: string;
    recordDelete_timeMillis?: number;
    recordDelete_dateString?: string;
    canUpdate?: boolean;
};
export declare type LicencePlate = {
    licencePlateCountry: string;
    licencePlateProvince: string;
    licencePlateNumber: string;
};
export interface ParkingTicket extends Record, LicencePlate, ParkingLocation {
    recordType: "ticket";
    ticketID: number;
    ticketNumber: string;
    issueDate: number;
    issueDateString: string;
    issueTime: number;
    issueTimeString: string;
    issuingOfficer: string;
    bylawNumber: string;
    locationDescription: string;
    parkingOffence: string;
    offenceAmount: number;
    vehicleMakeModel: string;
    resolvedDate: number;
    resolvedDateString: string;
    latestStatus_statusKey: string;
    latestStatus_statusDate: number;
    latestStatus_statusDateString: string;
    licencePlateOwner: LicencePlateOwner;
    location: ParkingLocation;
    statusLog: ParkingTicketStatusLog[];
    remarks: ParkingTicketRemark[];
}
export interface ParkingTicketStatusLog extends Record {
    recordType: "status";
    ticketID: number;
    statusIndex?: number;
    statusDate?: number;
    statusDateString?: string;
    statusTime?: number;
    statusTimeString?: string;
    statusKey: string;
    statusField: string;
    statusNote: string;
}
export interface ParkingTicketRemark extends Record {
    recordType: "remark";
    ticketID: number;
    remarkIndex: number;
    remarkDate: number;
    remarkDateString: string;
    remarkTime: number;
    remarkTimeString: string;
    remark: string;
}
export declare type ParkingLocation = {
    locationKey: string;
    locationName: string;
    locationClassKey: string;
    isActive: boolean;
};
export declare type ParkingBylaw = {
    bylawNumber: string;
    bylawDescription: string;
};
export interface ParkingOffence extends ParkingLocation, ParkingBylaw {
    parkingOffence: string;
    offenceAmount: number;
    accountNumber: string;
}
export interface LicencePlateOwner extends Record, LicencePlate {
    recordType: "owner";
    recordDate: number;
    recordDateString: string;
    licencePlateExpiryDate: number;
    licencePlateExpiryDateString: string;
    vehicleNCIC: string;
    vehicleMake: string;
    ownerName1: string;
    ownerName2: string;
    ownerAddress: string;
    ownerCity: string;
    ownerProvince: string;
    ownerPostalCode: string;
    ownerGenderKey: string;
    driverLicenceNumber: string;
}
export interface LicencePlateLookupBatch extends Record {
    batchID: number;
    batchDate: number;
    batchDateString: string;
    lockDate: number;
    lockDateString: string;
    sentDate: number;
    sentDateString: string;
    receivedDate: number;
    receivedDateString: string;
    batchEntries: LicencePlateLookupBatchEntry[];
}
export interface LicencePlateLookupBatchEntry extends LicencePlate, ParkingTicket {
    batchID: number;
}
export declare type User = {
    userName: string;
    firstName?: string;
    lastName?: string;
    userProperties?: UserProperties;
};
export declare type UserProperties = {
    isDefaultAdmin: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    isAdmin: boolean;
};
export {};
