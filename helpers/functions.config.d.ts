import type { ConfigActiveDirectory, ConfigLicencePlateCountry, ConfigLocationClass, ConfigParkingTicketStatus } from '../types/configTypes.js';
export declare function getProperty(propertyName: 'activeDirectory'): ConfigActiveDirectory;
export declare function getProperty(propertyName: 'application.applicationName' | 'application.logoURL' | 'application.userDomain' | 'defaults.country' | 'defaults.province'): string;
export declare function getProperty(propertyName: 'application.httpPort' | 'databaseCleanup.windowDays'): number;
export declare function getProperty(propertyName: 'application.useTestDatabases'): boolean;
export declare function getProperty(propertyName: 'locationClasses'): ConfigLocationClass[];
export declare function getProperty(propertyName: 'licencePlateCountryAliases'): Record<string, string>;
export declare function getProperty(propertyName: 'licencePlateProvinceAliases'): Record<string, Record<string, string>>;
export declare function getProperty(propertyName: 'licencePlateProvinces'): Record<string, ConfigLicencePlateCountry>;
export declare function getProperty(propertyName: 'parkingOffences.accountNumber.pattern'): RegExp;
export declare function getProperty(propertyName: 'parkingTickets.licencePlateExpiryDate.includeDay'): boolean;
export declare function getProperty(propertyName: 'parkingTickets.ticketNumber.fieldLabel'): string;
export declare function getProperty(propertyName: 'parkingTickets.ticketNumber.isUnique'): boolean;
export declare function getProperty(propertyName: 'parkingTickets.ticketNumber.nextTicketNumberFn'): (currentTicketNumber: string) => string;
export declare function getProperty(propertyName: 'parkingTickets.ticketNumber.pattern'): RegExp;
export declare function getProperty(propertyName: 'parkingTickets.updateWindowMillis'): number;
export declare function getProperty(propertyName: 'parkingTicketStatuses'): ConfigParkingTicketStatus[];
export declare function getProperty(propertyName: 'session.cookieName'): string;
export declare function getProperty(propertyName: 'session.doKeepAlive'): boolean;
export declare function getProperty(propertyName: 'session.maxAgeMillis'): number;
export declare function getProperty(propertyName: 'session.secret'): string;
export declare function getProperty(propertyName: 'users.testing' | 'users.canLogin' | 'users.canUpdate' | 'users.isAdmin' | 'users.isOperator'): string[];
export declare function getProperty(propertyName: 'application.feature_mtoExportImport'): boolean;
export declare function getProperty(propertyName: 'mtoExportImport.authorizedUser'): string;
export declare function getProperty(propertyName: 'application.task_nhtsa.runTask'): boolean;
export declare function getProperty(propertyName: 'application.task_nhtsa.executeHour'): number;
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
