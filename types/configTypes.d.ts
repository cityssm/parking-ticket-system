export interface Config {
    application?: ConfigApplicationConfig;
    session?: ConfigSessionConfig;
    reverseProxy?: {
        disableCompression: boolean;
        disableEtag: boolean;
        urlPrefix: string;
    };
    activeDirectory?: ConfigActiveDirectory;
    users?: {
        testing?: string[];
        canLogin?: string[];
        canUpdate?: string[];
        isAdmin?: string[];
        isOperator?: string[];
    };
    defaults?: ConfigDefaultsConfig;
    parkingTickets?: ConfigParkingTickets;
    parkingTicketStatuses?: ConfigParkingTicketStatus[];
    licencePlateCountryAliases?: Record<string, string>;
    licencePlateProvinceAliases?: Record<string, Record<string, string>>;
    licencePlateProvinces?: Record<string, ConfigLicencePlateCountry>;
    genders?: ConfigGender[];
    parkingOffences?: ConfigParkingOffences;
    locationClasses?: ConfigLocationClass[];
    mtoExportImport?: ConfigMTOExportImport;
    databaseCleanup?: {
        windowDays: number;
    };
}
interface ConfigApplicationConfig {
    applicationName?: string;
    logoURL?: string;
    httpPort?: number;
    userDomain?: string;
    useTestDatabases?: boolean;
    feature_mtoExportImport?: boolean;
    task_nhtsa?: ConfigApplicationTask;
}
export interface ConfigApplicationTask {
    runTask: boolean;
    executeHour: number;
}
interface ConfigSessionConfig {
    cookieName?: string;
    secret?: string;
    maxAgeMillis?: number;
    doKeepAlive?: boolean;
}
export interface ConfigActiveDirectory {
    url: string;
    baseDN: string;
    username: string;
    password: string;
}
interface ConfigDefaultsConfig {
    province: string;
    country: string;
}
export interface ConfigLocationClass {
    locationClassKey: string;
    locationClass: string;
}
interface ConfigParkingTickets {
    ticketNumber: {
        fieldLabel?: string;
        pattern?: RegExp;
        isUnique?: boolean;
        nextTicketNumberFn?: (currentTicketNumber: string) => string;
    };
    licencePlateExpiryDate: {
        includeDay?: boolean;
    };
    updateWindowMillis?: number;
}
type ParkingTicketStatusKey = 'receipt' | 'paid' | 'ownerLookupPending' | 'ownerLookupMatch' | 'ownerLookupError' | 'withdrawn' | 'trial' | 'convictionBatch' | 'convicted';
export interface ConfigParkingTicketStatus {
    statusKey: ParkingTicketStatusKey;
    status: string;
    statusField?: {
        fieldLabel: string;
    };
    statusField2?: {
        fieldLabel: string;
    };
    isFinalStatus: boolean;
    isUserSettable: boolean;
}
export interface ConfigParkingOffences {
    accountNumber: {
        pattern?: RegExp;
    };
}
export interface ConfigLicencePlateCountry {
    countryShortName: string;
    provinces: Record<string, ConfigLicencePlateProvince>;
}
interface ConfigLicencePlateProvince {
    provinceShortName: string;
    color: string;
    backgroundColor: string;
}
interface ConfigGender {
    genderKey: string;
    gender: string;
}
interface ConfigMTOExportImport {
    authorizedUser?: string;
}
export {};
