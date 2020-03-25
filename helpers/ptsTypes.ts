import sqlite = require("better-sqlite3");


export type Config = {
  application?: Config_ApplicationConfig,
  session?: Config_SessionConfig,
  admin?: Config_AdminDefaults,
  defaults?: Config_DefaultsConfig,
  locationClasses?: Config_LocationClass[],
  parkingTickets?: Config_ParkingTickets,
  parkingTicketStatuses?: Config_ParkingTicketStatus[],
  genders?: Config_Gender[],
  licencePlateCountryAliases?: { [countryKey: string]: string },
  licencePlateProvinceAliases?: { [country: string]: { [provinceKey: string]: string } },
  licencePlateProvinces?: {[country: string]: Config_LicencePlateCountry},
  mtoExportImport?: Config_MTOExportImport
};


type Config_ApplicationConfig = {
  applicationName?: string,
  logoURL?: string,
  httpPort?: number,
  https?: Config_HttpsConfig,

  feature_mtoExportImport?: boolean,

  task_nhtsa?: Config_ApplicationTask
};

export type Config_ApplicationTask = {
  runTask: boolean,
  executeHour: number
};

export type Config_HttpsConfig = {
  port: number,
  keyPath: string,
  certPath: string,
  passphrase: string
};

type Config_SessionConfig = {
  cookieName: string,
  secret: string,
  maxAgeMillis: number
};

type Config_AdminDefaults = {
  defaultPassword?: string
};

type Config_DefaultsConfig = {
  province: string,
  country: string
};

export type Config_LocationClass = {

  locationClassKey: string,
  locationClass: string,

};

type Config_ParkingTickets = {
  ticketNumber: {
    fieldLabel?: string,
    pattern?: RegExp,
    isUnique?: boolean,
    nextTicketNumberFn?: (currentTicketNumber: string) => string
  }
};

export type Config_ParkingTicketStatus = {
  statusKey: string,
  status: string,
  statusField?: {
    fieldLabel: string
  },
  isFinalStatus: boolean,
  isUserSettable: boolean
};

type Config_LicencePlateCountry = {
  countryShortName: string,
  provinces: {[province: string]: Config_LicencePlateProvince}
};

type Config_LicencePlateProvince = {
  provinceShortName: string,
  color: string,
  backgroundColor: string
};

type Config_Gender = {
  genderKey: string,
  gender: string
};

type Config_MTOExportImport = {
  authorizedUser?: string
};


export type RawRowsColumnsReturn = {
  rows: object[],
  columns: sqlite.ColumnDefinition[]
};


/*
 * PARKING DB TYPES
 */


export type Record = {
  recordType: "ticket" | "remark" | "status" | "owner",

  recordCreate_userName: string,
  recordCreate_timeMillis: number,

  recordUpdate_userName: string,
  recordUpdate_timeMillis: number,
  recordUpdate_dateString: string,

  recordDelete_userName?: string,
  recordDelete_timeMillis?: number,
  recordDelete_dateString?: string,

  canUpdate: boolean
};

export type LicencePlate = {

  licencePlateCountry: string,
  licencePlateProvince: string,
  licencePlateNumber: string
};

export interface ParkingTicket extends Record, LicencePlate, ParkingLocation {

  recordType: "ticket",

  ticketID: number,
  ticketNumber: string,

  issueDate: number,
  issueDateString: string,

  issueTime: number,
  issueTimeString: string

  issuingOfficer: string,

  bylawNumber: string,

  locationDescription: string,
  parkingOffence: string,
  offenceAmount: number,
  vehicleMakeModel: string,

  resolvedDate: number,
  resolvedDateString: string,

  latestStatus_statusKey: string,
  latestStatus_statusDate: number,
  latestStatus_statusDateString: string,

  licencePlateOwner: LicencePlateOwner,
  location: ParkingLocation,
  statusLog: ParkingTicketStatusLog[],
  remarks: ParkingTicketRemark[]
};

export interface ParkingTicketStatusLog extends Record {

  recordType: "status",

  ticketID: number,
  statusIndex: number,

  statusDate: number,
  statusDateString: string,

  statusTime: number,
  statusTimeString: string,

  statusKey: string,
  statusField: string,
  statusNote: string
};

export interface ParkingTicketRemark extends Record {

  recordType: "remark",

  ticketID: number,
  remarkIndex: number,

  remarkDate: number,
  remarkDateString: string,

  remarkTime: number,
  remarkTimeString: string,

  remark: string
};


export type ParkingLocation = {

  locationKey: string,
  locationName: string,
  locationClassKey: string,
  isActive: boolean

};


export type ParkingBylaw = {

  bylawNumber: string,
  bylawDescription: string
};

export interface ParkingOffence extends ParkingLocation, ParkingBylaw {

  parkingOffence: string,
  offenceAmount: number,
  accountNumber: string
};


export interface LicencePlateOwner extends Record, LicencePlate {

  recordType: "owner",

  recordDate: number,
  recordDateString: string,

  vehicleNCIC: string,
  vehicleMake: string,

  ownerName1: string,
  ownerName2: string,
  ownerAddress: string,
  ownerCity: string,
  ownerProvince: string,
  ownerPostalCode: string,
  ownerGenderKey: string,

  driverLicenceNumber: string,

  driverLicenceExpiryDate: number,
  driverLicenceExpiryDateString: string
};


export interface LicencePlateLookupBatch extends Record {

  batchID: number,

  batchDate: number,
  batchDateString: string,

  lockDate: number,
  lockDateString: string,

  sentDate: number,
  sentDateString: string,

  receivedDate: number,
  receivedDateString: string

  batchEntries: LicencePlateLookupBatchEntry[]
};

export interface LicencePlateLookupBatchEntry extends LicencePlate, ParkingTicket {
  batchID: number
};

/*
 * USER DB TYPES
 */


export type User = {
  userName: string,
  firstName?: string,
  lastName?: string,
  userProperties?: UserProperties
};

export type UserProperties = {
  isDefaultAdmin: boolean,
  canCreate: boolean,
  canUpdate: boolean,
  isAdmin: boolean
};
