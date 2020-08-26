export interface Config {
  application?: ConfigApplicationConfig;
  session?: ConfigSessionConfig;
  admin?: ConfigAdminDefaults;
  defaults?: ConfigDefaultsConfig;
  parkingTickets?: ConfigParkingTickets;
  parkingTicketStatuses?: ConfigParkingTicketStatus[];
  licencePlateCountryAliases?: { [countryShortName: string]: string };
  licencePlateProvinceAliases?: { [countryName: string]: { [provinceShortName: string]: string } };
  licencePlateProvinces?: { [countryName: string]: ConfigLicencePlateCountry };
  genders?: ConfigGender[];
  parkingOffences?: ConfigParkingOffences;
  locationClasses?: ConfigLocationClass[];
  mtoExportImport?: ConfigMTOExportImport;
  databaseCleanup?: { windowDays: number };
}


interface ConfigApplicationConfig {
  applicationName?: string;
  logoURL?: string;
  httpPort?: number;
  https?: ConfigHttpsConfig;

  feature_mtoExportImport?: boolean;

  task_nhtsa?: ConfigApplicationTask;
}

export interface ConfigApplicationTask {
  runTask: boolean;
  executeHour: number;
}

export interface ConfigHttpsConfig {
  port: number;
  keyPath: string;
  certPath: string;
  passphrase?: string;
}

interface ConfigSessionConfig {
  cookieName?: string;
  secret?: string;
  maxAgeMillis?: number;
  doKeepAlive?: boolean;
}

interface ConfigAdminDefaults {
  defaultPassword?: string;
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
}

export interface ConfigParkingTicketStatus {
  statusKey: string;
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
  provinces: { [province: string]: ConfigLicencePlateProvince };
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
