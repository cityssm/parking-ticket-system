import sqlite from 'better-sqlite3';
import Debug from 'debug';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
const debug = Debug('parking-ticket-system:parkingDB:initializeDatabase');
const recordFields = ` recordCreate_userName varchar(30) not null,
    recordCreate_timeMillis integer not null,
    recordUpdate_userName varchar(30) not null,
    recordUpdate_timeMillis integer not null,
    recordDelete_userName varchar(30),
    recordDelete_timeMillis integer`;
function createParkingLocations(parkingDB) {
    parkingDB
        .prepare(`create table if not exists ParkingLocations (
        locationKey varchar(20) primary key not null,
        locationName varchar(200) not null,
        locationClassKey varchar(20) not null,
        orderNumber integer not null default 0,
        isActive bit not null default 1) without rowid`)
        .run();
    parkingDB
        .prepare(`insert into ParkingLocations (
        locationKey, locationName, locationClassKey, orderNumber, isActive)
        values ('', '(No Location)', '', 0, 1)`)
        .run();
}
function createParkingBylaws(parkingDB) {
    parkingDB
        .prepare(`create table if not exists ParkingBylaws (
        bylawNumber varchar(20) primary key not null,
        bylawDescription varchar(200) not null,
        orderNumber integer not null default 0,
        isActive bit not null default 1) without rowid`)
        .run();
}
function createParkingOffences(parkingDB) {
    parkingDB
        .prepare(`create table if not exists ParkingOffences (
        bylawNumber varchar(20) not null,
        locationKey varchar(20),
        parkingOffence text,
        offenceAmount decimal(6, 2) not null,
        discountOffenceAmount decimal(6, 2) not null default offenceAmount,
        discountDays integer not null default 0,
        accountNumber varchar(20),
        isActive bit not null default 1,
        primary key (bylawNumber, locationKey),
        foreign key (bylawNumber) references ParkingBylaws (bylawNumber),
        foreign key (locationKey) references ParkingLocations (locationKey)) without rowid`)
        .run();
}
function createParkingTickets(parkingDB) {
    parkingDB
        .prepare(`create table if not exists ParkingTickets (
        ticketId integer primary key autoincrement,
        ticketNumber varchar(10),
        issueDate integer not null,
        issueTime integer,
        issuingOfficer varchar(30),
        licencePlateIsMissing bit not null default 0,
        licencePlateCountry varchar(2),
        licencePlateProvince varchar(5),
        licencePlateNumber varchar(15),
        licencePlateExpiryDate integer,
        vehicleVIN varchar(20),
        bylawNumber varchar(20),
        locationKey varchar(20),
        locationDescription text,
        parkingOffence text,
        offenceAmount decimal(6, 2) not null,
        discountOffenceAmount decimal(6, 2) not null default offenceAmount,
        discountDays integer not null default 0,
        vehicleMakeModel varchar(30), 
        resolvedDate integer,
        ${recordFields},
        foreign key (locationKey) references ParkingLocations (locationKey))`)
        .run();
    parkingDB
        .prepare(`create index if not exists ParkingTickets_LicencePlateIndex on ParkingTickets (
        licencePlateCountry, licencePlateProvince, licencePlateNumber)`)
        .run();
}
function createParkingTicketRemarks(parkingDB) {
    parkingDB
        .prepare(`create table if not exists ParkingTicketRemarks (
        ticketId integer not null,
        remarkIndex integer not null,
        remarkDate integer not null,
        remarkTime integer not null,
        remark text,
        ${recordFields},
        primary key (ticketId, remarkIndex),
        foreign key (ticketId) references ParkingTickets (ticketId)) without rowid`)
        .run();
}
function createParkingTicketStatusLog(parkingDB) {
    parkingDB
        .prepare(`create table if not exists ParkingTicketStatusLog (
        ticketId integer not null,
        statusIndex integer not null,
        statusDate integer not null,
        statusTime integer not null,
        statusKey varchar(20) not null,
        statusField text,
        statusField2 text,
        statusNote text,
        ${recordFields},
        primary key (ticketId, statusIndex),
        foreign key (ticketId) references ParkingTickets (ticketId)) without rowid`)
        .run();
}
function createLicencePlateLookupBatches(parkingDB) {
    parkingDB
        .prepare(`create table if not exists LicencePlateLookupBatches (
        batchId integer primary key autoincrement,
        batchDate integer not null,
        lockDate integer,
        sentDate integer,
        receivedDate integer,
        mto_includeLabels bit not null default 0,
        ${recordFields})`)
        .run();
}
function createLicencePlateLookupBatchEntries(parkingDB) {
    parkingDB
        .prepare(`create table if not exists LicencePlateLookupBatchEntries (
        batchId integer not null,
        ticketId integer,
        licencePlateCountry varchar(2) not null,
        licencePlateProvince varchar(5) not null,
        licencePlateNumber varchar(15) not null,
        primary key (batchId, ticketId, licencePlateCountry, licencePlateProvince, licencePlateNumber),
        foreign key (batchId) references LicencePlateLookupBatches (batchId),
        foreign key (ticketId) references ParkingTickets (ticketId)) without rowid`)
        .run();
}
function createParkingTicketConvictionBatches(parkingDB) {
    parkingDB
        .prepare(`create table if not exists ParkingTicketConvictionBatches (
        batchId integer primary key autoincrement,
        batchDate integer not null,
        lockDate integer,
        sentDate integer,
        ${recordFields})`)
        .run();
}
function createLicencePlateOwners(parkingDB) {
    parkingDB
        .prepare(`create table if not exists LicencePlateOwners (
        licencePlateCountry varchar(2) not null,
        licencePlateProvince varchar(5) not null,
        licencePlateNumber varchar(15) not null,
        recordDate integer not null,
        vehicleNCIC varchar(5),
        vehicleYear integer,
        vehicleColor varchar(15),
        licencePlateExpiryDate integer,
        ownerName1 varchar(50),
        ownerName2 varchar(50),
        ownerAddress varchar(100),
        ownerCity varchar(20),
        ownerProvince varchar(15),
        ownerPostalCode varchar(7),
        ownerGenderKey varchar(2),
        driverLicenceNumber varchar(20),
        ${recordFields},
        primary key (licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDate)) without rowid`)
        .run();
}
function createLicencePlateLookupErrorLog(parkingDB) {
    parkingDB
        .prepare(`create table if not exists LicencePlateLookupErrorLog (
        batchId integer not null,
        logIndex integer not null,
        licencePlateCountry varchar(2) not null,
        licencePlateProvince varchar(5) not null,
        licencePlateNumber varchar(15) not null,
        recordDate integer not null,
        errorCode varchar(10),
        errorMessage varchar(100),
        isAcknowledged bit not null default 0,
        ${recordFields},
        primary key (batchId, logIndex),
        foreign key (batchId) references LicencePlateLookupBatches (batchId)) without rowid`)
        .run();
    parkingDB
        .prepare(`create unique index if not exists LicencePlateLookupErrorLog_LicencePlateIndex
        on LicencePlateLookupErrorLog (
          licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDate)`)
        .run();
}
export function initializeDatabase() {
    const parkingDB = sqlite(databasePath);
    let doCreate = false;
    const row = parkingDB
        .prepare("select name from sqlite_master where type = 'table' and name = 'ParkingTickets'")
        .get();
    if (row === undefined) {
        debug(`Creating ${databasePath}`);
        doCreate = true;
        createParkingLocations(parkingDB);
        createParkingBylaws(parkingDB);
        createParkingOffences(parkingDB);
        createParkingTickets(parkingDB);
        createParkingTicketRemarks(parkingDB);
        createParkingTicketStatusLog(parkingDB);
        createLicencePlateLookupBatches(parkingDB);
        createLicencePlateLookupBatchEntries(parkingDB);
        createParkingTicketConvictionBatches(parkingDB);
        createLicencePlateOwners(parkingDB);
        createLicencePlateLookupErrorLog(parkingDB);
    }
    parkingDB.close();
    return doCreate;
}
