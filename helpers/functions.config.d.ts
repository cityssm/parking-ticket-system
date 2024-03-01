import type { ConfigActiveDirectory, ConfigLicencePlateCountry, ConfigLocationClass, ConfigParkingTicketStatus } from '../types/configTypes.js';
export declare function getConfigProperty(propertyName: 'activeDirectory'): ConfigActiveDirectory;
export declare function getConfigProperty(propertyName: 'application.applicationName' | 'application.logoURL' | 'application.userDomain' | 'reverseProxy.urlPrefix' | 'session.cookieName' | 'session.secret' | 'defaults.country' | 'defaults.province' | 'parkingTickets.ticketNumber.fieldLabel' | 'mtoExportImport.authorizedUser'): string;
export declare function getConfigProperty(propertyName: 'application.httpPort' | 'application.maximumProcesses' | 'application.task_nhtsa.executeHour' | 'session.maxAgeMillis' | 'databaseCleanup.windowDays' | 'parkingTickets.updateWindowMillis'): number;
export declare function getConfigProperty(propertyName: 'application.useTestDatabases' | 'application.feature_mtoExportImport' | 'application.task_nhtsa.runTask' | 'session.doKeepAlive' | 'parkingTickets.licencePlateExpiryDate.includeDay' | 'parkingTickets.ticketNumber.isUnique'): boolean;
export declare function getConfigProperty(propertyName: 'parkingOffences.accountNumber.pattern' | 'parkingTickets.ticketNumber.pattern'): RegExp;
export declare function getConfigProperty(propertyName: 'locationClasses'): ConfigLocationClass[];
export declare function getConfigProperty(propertyName: 'licencePlateCountryAliases'): Record<string, string>;
export declare function getConfigProperty(propertyName: 'licencePlateProvinceAliases'): Record<string, Record<string, string>>;
export declare function getConfigProperty(propertyName: 'licencePlateProvinces'): Record<string, ConfigLicencePlateCountry>;
export declare function getConfigProperty(propertyName: 'parkingTickets.ticketNumber.nextTicketNumberFn'): (currentTicketNumber: string) => string;
export declare function getConfigProperty(propertyName: 'parkingTicketStatuses'): ConfigParkingTicketStatus[];
export declare function getConfigProperty(propertyName: 'users.testing' | 'users.canLogin' | 'users.canUpdate' | 'users.isAdmin' | 'users.isOperator'): string[];
export declare const keepAliveMillis: number;
export declare function getParkingTicketStatus(statusKey: string): ConfigParkingTicketStatus | undefined;
interface LicencePlateLocationProperties {
    licencePlateCountryAlias: string;
    licencePlateProvinceAlias: string;
    licencePlateProvince: {
        provinceShortName: string;
        color: string;
        backgroundColor: string;
    };
}
export declare function getLicencePlateLocationProperties(originalLicencePlateCountry: string, originalLicencePlateProvince: string): LicencePlateLocationProperties;
export {};
