import type { ConfigActiveDirectory, ConfigLicencePlateCountry, ConfigLocationClass, ConfigParkingTicketStatus } from '../types/configTypes.js';
export declare function getProperty(propertyName: 'activeDirectory'): ConfigActiveDirectory;
export declare function getProperty(propertyName: 'application.applicationName' | 'application.logoURL' | 'application.userDomain' | 'session.cookieName' | 'session.secret' | 'defaults.country' | 'defaults.province' | 'parkingTickets.ticketNumber.fieldLabel' | 'mtoExportImport.authorizedUser'): string;
export declare function getProperty(propertyName: 'application.httpPort' | 'application.maximumProcesses' | 'application.task_nhtsa.executeHour' | 'session.maxAgeMillis' | 'databaseCleanup.windowDays' | 'parkingTickets.updateWindowMillis'): number;
export declare function getProperty(propertyName: 'application.useTestDatabases' | 'application.feature_mtoExportImport' | 'application.task_nhtsa.runTask' | 'session.doKeepAlive' | 'parkingTickets.licencePlateExpiryDate.includeDay' | 'parkingTickets.ticketNumber.isUnique'): boolean;
export declare function getProperty(propertyName: 'parkingOffences.accountNumber.pattern' | 'parkingTickets.ticketNumber.pattern'): RegExp;
export declare function getProperty(propertyName: 'locationClasses'): ConfigLocationClass[];
export declare function getProperty(propertyName: 'licencePlateCountryAliases'): Record<string, string>;
export declare function getProperty(propertyName: 'licencePlateProvinceAliases'): Record<string, Record<string, string>>;
export declare function getProperty(propertyName: 'licencePlateProvinces'): Record<string, ConfigLicencePlateCountry>;
export declare function getProperty(propertyName: 'parkingTickets.ticketNumber.nextTicketNumberFn'): (currentTicketNumber: string) => string;
export declare function getProperty(propertyName: 'parkingTicketStatuses'): ConfigParkingTicketStatus[];
export declare function getProperty(propertyName: 'users.testing' | 'users.canLogin' | 'users.canUpdate' | 'users.isAdmin' | 'users.isOperator'): string[];
export declare const keepAliveMillis: number;
export declare const getParkingTicketStatus: (statusKey: string) => ConfigParkingTicketStatus | undefined;
interface LicencePlateLocationProperties {
    licencePlateCountryAlias: string;
    licencePlateProvinceAlias: string;
    licencePlateProvince: {
        provinceShortName: string;
        color: string;
        backgroundColor: string;
    };
}
export declare const getLicencePlateLocationProperties: (originalLicencePlateCountry: string, originalLicencePlateProvince: string) => LicencePlateLocationProperties;
export {};
