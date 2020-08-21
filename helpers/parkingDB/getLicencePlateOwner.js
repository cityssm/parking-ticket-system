"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLicencePlateOwner = exports.getLicencePlateOwnerWithDB = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const configFns = require("../configFns");
const vehicleFns = require("../vehicleFns");
const parkingDB_1 = require("../parkingDB");
exports.getLicencePlateOwnerWithDB = (db, licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore) => {
    const licencePlateCountryAlias = configFns.getProperty("licencePlateCountryAliases")[licencePlateCountry] || licencePlateCountry;
    const licencePlateProvinceAlias = (configFns.getProperty("licencePlateProvinceAliases")[licencePlateCountryAlias] || {})[licencePlateProvince] || licencePlateProvince;
    const possibleOwners = db.prepare("select * from LicencePlateOwners" +
        " where recordDelete_timeMillis is null" +
        " and licencePlateNumber = ?" +
        " and recordDate >= ?" +
        " order by recordDate")
        .all(licencePlateNumber, recordDateOrBefore);
    for (const possibleOwnerObj of possibleOwners) {
        const ownerPlateCountryAlias = configFns.getProperty("licencePlateCountryAliases")[possibleOwnerObj.licencePlateCountry] ||
            possibleOwnerObj.licencePlateCountry;
        const ownerPlateProvinceAlias = (configFns.getProperty("licencePlateProvinceAliases")[ownerPlateCountryAlias] || {})[possibleOwnerObj.licencePlateProvince] || possibleOwnerObj.licencePlateProvince;
        if (licencePlateCountryAlias === ownerPlateCountryAlias &&
            licencePlateProvinceAlias === ownerPlateProvinceAlias) {
            possibleOwnerObj.recordDateString = dateTimeFns.dateIntegerToString(possibleOwnerObj.recordDate);
            possibleOwnerObj.licencePlateExpiryDateString =
                dateTimeFns.dateIntegerToString(possibleOwnerObj.licencePlateExpiryDate);
            possibleOwnerObj.vehicleMake = vehicleFns.getMakeFromNCIC(possibleOwnerObj.vehicleNCIC);
            return possibleOwnerObj;
        }
    }
    return null;
};
exports.getLicencePlateOwner = (licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore) => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const ownerRecord = exports.getLicencePlateOwnerWithDB(db, licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore);
    db.close();
    return ownerRecord;
};
