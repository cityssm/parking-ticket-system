import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as configFns from "../configFns.js";
import * as vehicleFns from "../vehicleFns.js";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const getLicencePlateOwnerWithDB = (db, licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore) => {
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
export const getLicencePlateOwner = (licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore) => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const ownerRecord = getLicencePlateOwnerWithDB(db, licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore);
    db.close();
    return ownerRecord;
};
export default getLicencePlateOwner;
