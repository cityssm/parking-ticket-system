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
    fieldLabel?: string,
    pattern?: RegExp,
    isUnique?: boolean,
    nextTicketNumberFn?: (currentTicketNumber: string) => string
  };
  licencePlateExpiryDate: {
    includeDay?: boolean
  };
}

export interface ConfigParkingTicketStatus {
  statusKey: string;
  status: string;
  statusField?: {
    fieldLabel: string
  };
  statusField2?: {
    fieldLabel: string
  };
  isFinalStatus: boolean;
  isUserSettable: boolean;
}

export interface ConfigParkingOffences {
  accountNumber: {
    pattern?: RegExp
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


/*
 * PARKING DB TYPES
 */


export interface Record {
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
}

export interface LicencePlate {

  licencePlateCountry: string;
  licencePlateProvince: string;
  licencePlateNumber: string;

  licencePlateExpiryDate: number;
  licencePlateExpiryDateString: string;
  licencePlateExpiryYear: number | string;
  licencePlateExpiryMonth: number | string;
  licencePlateExpiryDay: number;
}

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
  discountOffenceAmount: number;
  discountDays: number;

  licencePlateIsMissing: boolean;
  vehicleMakeModel: string;
  vehicleVIN: string;

  resolvedDate: number;
  resolvedDateString: string;

  latestStatus_statusKey: string;
  latestStatus_statusDate: number;
  latestStatus_statusDateString: string;

  ownerLookup_statusKey: "ownerLookupPending" | "ownerLookupError" | "ownerLookupMatch";
  ownerLookup_statusField: string;

  licencePlateOwner: LicencePlateOwner;
  licencePlateOwner_ownerName1?: string;

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

  statusKey?: string;
  statusField?: string;
  statusField2?: string;
  statusNote?: string;

  // from ticket
  ticketNumber?: string;
  licencePlateNumber?: string;
  issueDate?: number;
  issueDateString?: string;
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


export interface ParkingLocation {

  locationKey: string;
  locationName: string;
  locationClassKey: string;
  isActive: boolean;
}


export interface ParkingBylaw {

  bylawNumber: string;
  bylawDescription: string;
  isActive: boolean;

  offenceCount?: number;
  offenceAmountMin?: number;
  offenceAmountMax?: number;

  discountOffenceAmountMin?: number;
  discountDaysMin?: number;
}

export interface ParkingOffence extends ParkingLocation, ParkingBylaw {

  parkingOffence: string;
  offenceAmount: number;
  discountOffenceAmount: number;
  discountDays: number;
  accountNumber: string;
}


export interface LicencePlateOwner extends Record, LicencePlate {

  recordType: "owner";

  recordDate: number;
  recordDateString: string;

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


export interface ParkingTicketConvictionBatch extends Record {

  batchID: number;

  batchDate: number;
  batchDateString: string;

  lockDate: number;
  lockDateString: string;

  sentDate: number;
  sentDateString: string;

  batchEntries?: ParkingTicketStatusLog[];
}


export interface NHTSAMakeModel {
  makeId: number;
  makeName: string;
  modelID: number;
  modelName: string;
}


/*
 * USER DB TYPES
 */


export interface User {
  userName: string;
  firstName?: string;
  lastName?: string;
  userProperties?: UserProperties;
}

export interface UserProperties {
  isDefaultAdmin: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  isAdmin: boolean;
  isOperator: boolean;
}
