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
  statusField: {
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
