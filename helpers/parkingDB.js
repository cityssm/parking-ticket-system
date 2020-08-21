"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistinctLicencePlateOwnerVehicleNCICs = exports.getRecentParkingTicketVehicleMakeModelValues = exports.getParkingLocationWithDB = exports.canUpdateObject = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const configFns = require("./configFns");
const databasePaths_1 = require("../data/databasePaths");
exports.canUpdateObject = (obj, reqSession) => {
    const userProperties = reqSession.user.userProperties;
    let canUpdate = false;
    if (!reqSession) {
        canUpdate = false;
    }
    else if (obj.recordDelete_timeMillis) {
        canUpdate = false;
    }
    else if (userProperties.canUpdate) {
        canUpdate = true;
    }
    else if (userProperties.canCreate &&
        (obj.recordCreate_userName === reqSession.user.userName ||
            obj.recordUpdate_userName === reqSession.user.userName) &&
        obj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") > Date.now()) {
        canUpdate = true;
    }
    if (obj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") > Date.now()) {
        return canUpdate;
    }
    if (canUpdate) {
        switch (obj.recordType) {
            case "ticket":
                if (obj.resolvedDate) {
                    canUpdate = false;
                }
                break;
        }
    }
    return canUpdate;
};
exports.getParkingLocationWithDB = (db, locationKey) => {
    const location = db.prepare("select locationKey, locationName, locationClassKey, isActive" +
        " from ParkingLocations" +
        " where locationKey = ?")
        .get(locationKey);
    return location;
};
exports.getRecentParkingTicketVehicleMakeModelValues = () => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const issueDate = dateTimeFns.dateToInteger(sixMonthsAgo);
    const rows = db.prepare("select vehicleMakeModel" +
        " from ParkingTickets" +
        " where recordDelete_timeMillis is null" +
        " and issueDate > ?" +
        " group by vehicleMakeModel" +
        " having count(vehicleMakeModel) > 3" +
        " order by vehicleMakeModel")
        .all(issueDate);
    db.close();
    const vehicleMakeModelList = [];
    for (const row of rows) {
        vehicleMakeModelList.push(row.vehicleMakeModel);
    }
    return vehicleMakeModelList;
};
exports.getDistinctLicencePlateOwnerVehicleNCICs = (cutoffDate) => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    const rows = db.prepare("select vehicleNCIC, max(recordDate) as recordDateMax" +
        " from LicencePlateOwners" +
        " where recordDate >= ?" +
        " group by vehicleNCIC" +
        " order by recordDateMax desc")
        .all(cutoffDate);
    db.close();
    return rows;
};
