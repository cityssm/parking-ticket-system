import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as vehicleFunctions from "../functions.vehicle.js";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const getAllLicencePlateOwners = (licencePlateCountry, licencePlateProvince, licencePlateNumber) => {
    const db = sqlite(dbPath, {
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
        owner.vehicleMake = vehicleFunctions.getMakeFromNCIC(owner.vehicleNCIC);
    }
    return owners;
};
export default getAllLicencePlateOwners;
