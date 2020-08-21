"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLicencePlateOwners = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const vehicleFns = require("../vehicleFns");
const parkingDB_1 = require("../parkingDB");
exports.getAllLicencePlateOwners = (licencePlateCountry, licencePlateProvince, licencePlateNumber) => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const owners = db.prepare("select recordDate, vehicleNCIC, vehicleYear, vehicleColor," +
        " ownerName1, ownerName2, ownerAddress, ownerCity, ownerProvince, ownerPostalCode" +
        " from LicencePlateOwners" +
        " where recordDelete_timeMillis is null" +
        " and licencePlateCountry = ?" +
        " and licencePlateProvince = ?" +
        " and licencePlateNumber = ?" +
        " order by recordDate desc")
        .all(licencePlateCountry, licencePlateProvince, licencePlateNumber);
    db.close();
    for (const owner of owners) {
        owner.recordDateString = dateTimeFns.dateIntegerToString(owner.recordDate);
        owner.vehicleMake = vehicleFns.getMakeFromNCIC(owner.vehicleNCIC);
    }
    return owners;
};
