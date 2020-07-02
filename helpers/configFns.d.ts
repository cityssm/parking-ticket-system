import type * as pts from "../helpers/ptsTypes";
export declare function getProperty(propertyName: "admin.defaultPassword"): string;
export declare function getProperty(propertyName: "application.applicationName"): string;
export declare function getProperty(propertyName: "application.logoURL"): string;
export declare function getProperty(propertyName: "application.httpPort"): number;
export declare function getProperty(propertyName: "application.https"): pts.ConfigHttpsConfig;
export declare function getProperty(propertyName: "databaseCleanup.windowDays"): number;
export declare function getProperty(propertyName: "defaults.country"): string;
export declare function getProperty(propertyName: "defaults.province"): string;
export declare function getProperty(propertyName: "locationClasses"): pts.ConfigLocationClass[];
export declare function getProperty(propertyName: "licencePlateCountryAliases"): {
    [countryShortName: string]: string;
};
export declare function getProperty(propertyName: "licencePlateProvinceAliases"): {
    [countryName: string]: {
        [provinceShortName: string]: string;
    };
};
export declare function getProperty(propertyName: "licencePlateProvinces"): {
    [countryName: string]: pts.ConfigLicencePlateCountry;
};
export declare function getProperty(propertyName: "parkingOffences.accountNumber.pattern"): RegExp;
export declare function getProperty(propertyName: "parkingTickets.licencePlateExpiryDate.includeDay"): boolean;
export declare function getProperty(propertyName: "parkingTickets.ticketNumber.fieldLabel"): string;
export declare function getProperty(propertyName: "parkingTickets.ticketNumber.isUnique"): boolean;
export declare function getProperty(propertyName: "parkingTickets.ticketNumber.nextTicketNumberFn"): (currentTicketNumber: string) => string;
export declare function getProperty(propertyName: "parkingTickets.ticketNumber.pattern"): RegExp;
export declare function getProperty(propertyName: "parkingTicketStatuses"): pts.ConfigParkingTicketStatus[];
export declare function getProperty(propertyName: "session.cookieName"): string;
export declare function getProperty(propertyName: "session.doKeepAlive"): boolean;
export declare function getProperty(propertyName: "session.maxAgeMillis"): number;
export declare function getProperty(propertyName: "session.secret"): string;
export declare function getProperty(propertyName: "user.createUpdateWindowMillis"): number;
export declare function getProperty(propertyName: "user.defaultProperties"): pts.UserProperties;
export declare function getProperty(propertyName: "application.feature_mtoExportImport"): boolean;
export declare function getProperty(propertyName: "mtoExportImport.authorizedUser"): string;
export declare function getProperty(propertyName: "application.task_nhtsa.runTask"): boolean;
export declare function getProperty(propertyName: "application.task_nhtsa.executeHour"): number;
export declare const keepAliveMillis: number;
export declare const getParkingTicketStatus: (statusKey: string) => pts.ConfigParkingTicketStatus;
export declare const getLicencePlateLocationProperties: (originalLicencePlateCountry: string, originalLicencePlateProvince: string) => {
    licencePlateCountryAlias: string;
    licencePlateProvinceAlias: string;
    licencePlateProvince: {
        provinceShortName: string;
        color: string;
        backgroundColor: string;
    };
};
