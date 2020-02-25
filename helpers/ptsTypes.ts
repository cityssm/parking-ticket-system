import sqlite = require("better-sqlite3");


export type Config = {
  application?: Config_ApplicationConfig,
  session?: Config_SessionConfig,
  admin?: Config_AdminDefaults,
  defaults?: Config_DefaultsConfig,
  locationClasses?: Config_LocationClass[],
  parkingTickets?: Config_ParkingTickets,
  parkingTicketStatuses?: Config_ParkingTicketStatus[],
  genders?: Config_Gender[]
};


type Config_ApplicationConfig = {
  applicationName?: string,
  logoURL?: string,
  httpPort?: number,
  https?: Config_HttpsConfig
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
  province: string
};

export type Config_LocationClass = {

  locationClassKey: string,
  locationClass: string,

};

type Config_ParkingTickets = {
  ticketNumber: {
    fieldLabel: string,
    pattern?: RegExp
  }
};

type Config_ParkingTicketStatus = {
  statusKey: string,
  status: string,
  statusField?: {
    fieldLabel: string
  },
  isFinalStatus: boolean
};

type Config_Gender = {
  genderKey: string,
  gender: string
};


export type RawRowsColumnsReturn = {
  rows: object[],
  columns: sqlite.ColumnDefinition[]
};


/*
 * PARKING DB TYPES
 */


export type Record = {
  recordType: "ticket" | "remark" | "status",

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

export type ParkingLocation = {
  locationKey: string,
  locationName: string,
  locationClassKey: string
};

export interface ParkingTicket extends Record, ParkingLocation {

  recordType: "ticket",

  ticketID: number,
  ticketNumber: string,

  issueDate: number,
  issueDateString: string,

  issueTime: number,
  issueTimeString: string

  issuingOfficer: string,

  licencePlateCountry: string,
  licencePlateProvince: string,
  licencePlateNumber: string,

  bylawNumber: string,

  locationDescription: string,
  parkingOffence: string,
  offenceAmount: number,
  vehicleMakeModel: string,

  resolvedDate: number,
  resolvedDateString: string
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
