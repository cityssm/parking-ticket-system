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
    licencePlateCountryAliases: object;
    licencePlateProvinceAliases: object;
    licencePlateProvinces: object;
};
declare type Config_ApplicationConfig = {
    applicationName?: string;
    logoURL?: string;
    httpPort?: number;
    https?: Config_HttpsConfig;
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
};
export declare type Config_LocationClass = {
    locationClassKey: string;
    locationClass: string;
};
declare type Config_ParkingTickets = {
    ticketNumber: {
        fieldLabel: string;
        pattern?: RegExp;
    };
};
declare type Config_ParkingTicketStatus = {
    statusKey: string;
    status: string;
    statusField?: {
        fieldLabel: string;
    };
    isFinalStatus: boolean;
};
declare type Config_Gender = {
    genderKey: string;
    gender: string;
};
export declare type RawRowsColumnsReturn = {
    rows: object[];
    columns: sqlite.ColumnDefinition[];
};
export declare type Record = {
    recordType: "ticket" | "remark" | "status";
    recordCreate_userName: string;
    recordCreate_timeMillis: number;
    recordUpdate_userName: string;
    recordUpdate_timeMillis: number;
    recordUpdate_dateString: string;
    recordDelete_userName?: string;
    recordDelete_timeMillis?: number;
    recordDelete_dateString?: string;
    canUpdate: boolean;
};
export declare type ParkingLocation = {
    locationKey: string;
    locationName: string;
    locationClassKey: string;
};
export interface ParkingTicket extends Record, ParkingLocation {
    recordType: "ticket";
    ticketID: number;
    ticketNumber: string;
    issueDate: number;
    issueDateString: string;
    issueTime: number;
    issueTimeString: string;
    issuingOfficer: string;
    licencePlateCountry: string;
    licencePlateProvince: string;
    licencePlateNumber: string;
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
