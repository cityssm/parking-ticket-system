"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initNHTSADB = exports.initParkingDB = exports.initUsersDB = void 0;
const log = require("fancy-log");
const sqlite = require("better-sqlite3");
exports.initUsersDB = () => {
    const usersDB = sqlite("data/users.db");
    const row = usersDB.prepare("select name from sqlite_master where type = 'table' and name = 'Users'").get();
    if (!row) {
        log.warn("Creating users.db." +
            " To get started creating users, set the 'admin.defaultPassword' property in your config.js file.");
        usersDB.prepare("create table if not exists Users (" +
            "userName varchar(30) primary key not null," +
            " firstName varchar(50), lastName varchar(50)," +
            " isActive bit not null default 1," +
            " passwordHash char(60) not null)" +
            " without rowid").run();
        usersDB.prepare("create table if not exists UserProperties (" +
            "userName varchar(30) not null," +
            " propertyName varchar(100) not null," +
            " propertyValue text," +
            " primary key (userName, propertyName)" +
            " foreign key (userName) references Users (userName))" +
            " without rowid").run();
        usersDB.close();
        return true;
    }
    usersDB.close();
    return false;
};
exports.initParkingDB = () => {
    const parkingDB = sqlite("data/parking.db");
    const row = parkingDB
        .prepare("select name from sqlite_master where type = 'table' and name = 'ParkingTickets'")
        .get();
    if (!row) {
        log.warn("Creating parking.db");
        parkingDB.prepare("create table if not exists ParkingLocations (" +
            "locationKey varchar(20) primary key not null," +
            " locationName varchar(200) not null," +
            " locationClassKey varchar(20) not null," +
            " orderNumber integer not null default 0," +
            " isActive bit not null default 1" +
            ") without rowid").run();
        parkingDB.prepare("insert into ParkingLocations" +
            " (locationKey, locationName, locationClassKey, orderNumber, isActive)" +
            " values ('', '(No Location)', '', 0, 1)")
            .run();
        parkingDB.prepare("create table if not exists ParkingBylaws (" +
            "bylawNumber varchar(20) primary key not null," +
            " bylawDescription varchar(200) not null," +
            " orderNumber integer not null default 0," +
            " isActive bit not null default 1" +
            ") without rowid").run();
        parkingDB.prepare("create table if not exists ParkingOffences (" +
            "bylawNumber varchar(20) not null," +
            " locationKey varchar(20)," +
            " parkingOffence text," +
            " offenceAmount decimal(6, 2) not null," +
            " discountOffenceAmount decimal(6, 2) not null default offenceAmount," +
            " discountDays integer not null default 0," +
            " accountNumber varchar(20)," +
            " isActive bit not null default 1," +
            " primary key (bylawNumber, locationKey)," +
            " foreign key (bylawNumber) references ParkingBylaws (bylawNumber)," +
            " foreign key (locationKey) references ParkingLocations (locationKey)" +
            ") without rowid").run();
        parkingDB.prepare("create table if not exists ParkingTickets (" +
            "ticketID integer primary key autoincrement," +
            " ticketNumber varchar(10)," +
            " issueDate integer not null," +
            " issueTime integer," +
            " issuingOfficer varchar(30)," +
            " licencePlateIsMissing bit not null default 0," +
            " licencePlateCountry varchar(2)," +
            " licencePlateProvince varchar(5)," +
            " licencePlateNumber varchar(15)," +
            " licencePlateExpiryDate integer," +
            " vehicleVIN varchar(20)," +
            " bylawNumber varchar(20)," +
            " locationKey varchar(20)," +
            " locationDescription text," +
            " parkingOffence text," +
            " offenceAmount decimal(6, 2) not null," +
            " discountOffenceAmount decimal(6, 2) not null default offenceAmount," +
            " discountDays integer not null default 0," +
            " vehicleMakeModel varchar(30)," +
            " resolvedDate integer," +
            " recordCreate_userName varchar(30) not null," +
            " recordCreate_timeMillis integer not null," +
            " recordUpdate_userName varchar(30) not null," +
            " recordUpdate_timeMillis integer not null," +
            " recordDelete_userName varchar(30)," +
            " recordDelete_timeMillis integer," +
            " foreign key (locationKey) references ParkingLocations (locationKey)" +
            ")").run();
        parkingDB.prepare("create index if not exists ParkingTickets_LicencePlateIndex on ParkingTickets" +
            " (licencePlateCountry, licencePlateProvince, licencePlateNumber)")
            .run();
        parkingDB.prepare("create table if not exists ParkingTicketRemarks (" +
            "ticketID integer not null," +
            " remarkIndex integer not null," +
            " remarkDate integer not null," +
            " remarkTime integer not null," +
            " remark text," +
            " recordCreate_userName varchar(30) not null," +
            " recordCreate_timeMillis integer not null," +
            " recordUpdate_userName varchar(30) not null," +
            " recordUpdate_timeMillis integer not null," +
            " recordDelete_userName varchar(30)," +
            " recordDelete_timeMillis integer," +
            " primary key (ticketID, remarkIndex)," +
            " foreign key (ticketID) references ParkingTickets (ticketID)" +
            ") without rowid").run();
        parkingDB.prepare("create table if not exists ParkingTicketStatusLog (" +
            "ticketID integer not null," +
            " statusIndex integer not null," +
            " statusDate integer not null," +
            " statusTime integer not null," +
            " statusKey varchar(20) not null," +
            " statusField text," +
            " statusField2 text," +
            " statusNote text," +
            " recordCreate_userName varchar(30) not null," +
            " recordCreate_timeMillis integer not null," +
            " recordUpdate_userName varchar(30) not null," +
            " recordUpdate_timeMillis integer not null," +
            " recordDelete_userName varchar(30)," +
            " recordDelete_timeMillis integer," +
            " primary key (ticketID, statusIndex)," +
            " foreign key (ticketID) references ParkingTickets (ticketID)" +
            ") without rowid").run();
        parkingDB.prepare("create table if not exists LicencePlateLookupBatches (" +
            "batchID integer primary key autoincrement," +
            " batchDate integer not null," +
            " lockDate integer," +
            " sentDate integer," +
            " receivedDate integer," +
            " recordCreate_userName varchar(30) not null," +
            " recordCreate_timeMillis integer not null," +
            " recordUpdate_userName varchar(30) not null," +
            " recordUpdate_timeMillis integer not null," +
            " recordDelete_userName varchar(30)," +
            " recordDelete_timeMillis integer" +
            ")").run();
        parkingDB.prepare("create table if not exists LicencePlateLookupBatchEntries (" +
            "batchID integer not null," +
            " licencePlateCountry varchar(2) not null," +
            " licencePlateProvince varchar(5) not null," +
            " licencePlateNumber varchar(15) not null," +
            " ticketID integer," +
            " primary key (batchID, licencePlateCountry, licencePlateProvince, licencePlateNumber)," +
            " foreign key (batchID) references LicencePlateLookupBatches (batchID)," +
            " foreign key (ticketID) references ParkingTickets (ticketID)" +
            ") without rowid").run();
        parkingDB.prepare("create table if not exists ParkingTicketConvictionBatches (" +
            "batchID integer primary key autoincrement," +
            " batchDate integer not null," +
            " lockDate integer," +
            " sentDate integer," +
            " recordCreate_userName varchar(30) not null," +
            " recordCreate_timeMillis integer not null," +
            " recordUpdate_userName varchar(30) not null," +
            " recordUpdate_timeMillis integer not null," +
            " recordDelete_userName varchar(30)," +
            " recordDelete_timeMillis integer" +
            ")").run();
        parkingDB.prepare("create table if not exists LicencePlateOwners (" +
            "licencePlateCountry varchar(2) not null," +
            " licencePlateProvince varchar(5) not null," +
            " licencePlateNumber varchar(15) not null," +
            " recordDate integer not null," +
            " vehicleNCIC varchar(5)," +
            " vehicleYear integer," +
            " vehicleColor varchar(15)," +
            " licencePlateExpiryDate integer," +
            " ownerName1 varchar(50)," +
            " ownerName2 varchar(50)," +
            " ownerAddress varchar(100)," +
            " ownerCity varchar(20)," +
            " ownerProvince varchar(15)," +
            " ownerPostalCode varchar(7)," +
            " ownerGenderKey varchar(2)," +
            " driverLicenceNumber varchar(20)," +
            " recordCreate_userName varchar(30) not null," +
            " recordCreate_timeMillis integer not null," +
            " recordUpdate_userName varchar(30) not null," +
            " recordUpdate_timeMillis integer not null," +
            " recordDelete_userName varchar(30)," +
            " recordDelete_timeMillis integer," +
            " primary key (licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDate)" +
            ") without rowid").run();
        parkingDB.prepare("create table if not exists LicencePlateLookupErrorLog (" +
            "batchID integer not null," +
            " logIndex integer not null," +
            " licencePlateCountry varchar(2) not null," +
            " licencePlateProvince varchar(5) not null," +
            " licencePlateNumber varchar(15) not null," +
            " recordDate integer not null," +
            " errorCode varchar(10)," +
            " errorMessage varchar(100)," +
            " isAcknowledged bit not null default 0," +
            " recordCreate_userName varchar(30) not null," +
            " recordCreate_timeMillis integer not null," +
            " recordUpdate_userName varchar(30) not null," +
            " recordUpdate_timeMillis integer not null," +
            " recordDelete_userName varchar(30)," +
            " recordDelete_timeMillis integer," +
            " primary key (batchID, logIndex)," +
            " foreign key (batchID) references LicencePlateLookupBatches (batchID)" +
            ") without rowid").run();
        parkingDB.prepare("create unique index if not exists LicencePlateLookupErrorLog_LicencePlateIndex" +
            " on LicencePlateLookupErrorLog (licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDate)")
            .run();
    }
    parkingDB.close();
    return false;
};
exports.initNHTSADB = () => {
    const nhtsaDB = sqlite("data/nhtsa.db");
    const row = nhtsaDB.prepare("select name from sqlite_master where type = 'table' and name = 'MakeModel'").get();
    if (!row) {
        log.warn("Creating nhtsa.db.");
        nhtsaDB.prepare("create table if not exists MakeModelSearchHistory (" +
            "searchString varchar(50) primary key not null," +
            " resultCount integer not null," +
            " searchExpiryMillis integer not null" +
            ") without rowid").run();
        nhtsaDB.prepare("create table if not exists MakeModel (" +
            "makeID integer, makeName varchar(50), modelID integer, modelName varchar(50)," +
            " recordCreate_timeMillis integer not null," +
            " recordUpdate_timeMillis integer not null," +
            " recordDelete_timeMillis integer," +
            " primary key (makeName, modelName)" +
            ") without rowid").run();
        return true;
    }
    nhtsaDB.close();
    return false;
};
