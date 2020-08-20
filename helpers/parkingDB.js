"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistinctLicencePlateOwnerVehicleNCICs = exports.getAllLicencePlateOwners = exports.getLicencePlateOwner = exports.getLicencePlates = exports.deleteParkingTicketStatus = exports.updateParkingTicketStatus = exports.createParkingTicketStatus = exports.getParkingTicketStatuses = exports.deleteParkingTicketRemark = exports.updateParkingTicketRemark = exports.createParkingTicketRemark = exports.getParkingTicketRemarks = exports.getRecentParkingTicketVehicleMakeModelValues = exports.getParkingTicketID = exports.getParkingTicketsByLicencePlate = exports.getLicencePlateOwnerWithDB = exports.getParkingLocationWithDB = exports.canUpdateObject = exports.dbPath = void 0;
const sqlite = require("better-sqlite3");
const vehicleFns = require("./vehicleFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const configFns = require("./configFns");
exports.dbPath = "data/parking.db";
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
exports.getParkingTicketsByLicencePlate = (licencePlateCountry, licencePlateProvince, licencePlateNumber, reqSession) => {
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    const tickets = db.prepare("select t.ticketID, t.ticketNumber, t.issueDate," +
        " t.vehicleMakeModel," +
        " t.locationKey, l.locationName, l.locationClassKey, t.locationDescription," +
        " t.parkingOffence, t.offenceAmount, t.resolvedDate," +
        " s.statusDate as latestStatus_statusDate," +
        " s.statusKey as latestStatus_statusKey," +
        " t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis" +
        " from ParkingTickets t" +
        " left join ParkingLocations l on t.locationKey = l.locationKey" +
        " left join ParkingTicketStatusLog s on t.ticketID = s.ticketID" +
        (" and s.statusIndex = (select statusIndex from ParkingTicketStatusLog s where t.ticketID = s.ticketID" +
            " order by s.statusDate desc, s.statusTime desc, s.statusIndex desc limit 1)") +
        " where t.recordDelete_timeMillis is null" +
        " and t.licencePlateCountry = ?" +
        " and t.licencePlateProvince = ?" +
        " and t.licencePlateNumber = ?" +
        " order by t.issueDate desc, t.ticketNumber desc")
        .all(licencePlateCountry, licencePlateProvince, licencePlateNumber);
    db.close();
    for (const ticket of tickets) {
        ticket.recordType = "ticket";
        ticket.issueDateString = dateTimeFns.dateIntegerToString(ticket.issueDate);
        ticket.resolvedDateString = dateTimeFns.dateIntegerToString(ticket.resolvedDate);
        ticket.latestStatus_statusDateString = dateTimeFns.dateIntegerToString(ticket.latestStatus_statusDate);
        ticket.canUpdate = exports.canUpdateObject(ticket, reqSession);
    }
    return tickets;
};
exports.getParkingTicketID = (ticketNumber) => {
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    const ticketRow = db.prepare("select ticketID" +
        " from ParkingTickets" +
        " where ticketNumber = ?" +
        " and recordDelete_timeMillis is null" +
        " order by ticketID desc" +
        " limit 1")
        .get(ticketNumber);
    db.close();
    if (ticketRow) {
        return ticketRow.ticketID;
    }
    return null;
};
exports.getRecentParkingTicketVehicleMakeModelValues = () => {
    const db = sqlite(exports.dbPath, {
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
exports.getParkingTicketRemarks = (ticketID, reqSession) => {
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    const remarkRows = db.prepare("select remarkIndex, remarkDate, remarkTime, remark," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from ParkingTicketRemarks" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " order by remarkDate desc, remarkTime desc, remarkIndex desc")
        .all(ticketID);
    db.close();
    for (const remark of remarkRows) {
        remark.recordType = "remark";
        remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate);
        remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime);
        remark.canUpdate = exports.canUpdateObject(remark, reqSession);
    }
    return remarkRows;
};
exports.createParkingTicketRemark = (reqBody, reqSession) => {
    const db = sqlite(exports.dbPath);
    const remarkIndexNew = db.prepare("select ifnull(max(remarkIndex), 0) as remarkIndexMax" +
        " from ParkingTicketRemarks" +
        " where ticketID = ?")
        .get(reqBody.ticketID)
        .remarkIndexMax + 1;
    const rightNow = new Date();
    const info = db.prepare("insert into ParkingTicketRemarks" +
        " (ticketID, remarkIndex, remarkDate, remarkTime, remark," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.ticketID, remarkIndexNew, dateTimeFns.dateToInteger(rightNow), dateTimeFns.dateToTimeInteger(rightNow), reqBody.remark, reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    db.close();
    return {
        success: (info.changes > 0)
    };
};
exports.updateParkingTicketRemark = (reqBody, reqSession) => {
    const db = sqlite(exports.dbPath);
    const info = db.prepare("update ParkingTicketRemarks" +
        " set remarkDate = ?," +
        " remarkTime = ?," +
        " remark = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateStringToInteger(reqBody.remarkDateString), dateTimeFns.timeStringToInteger(reqBody.remarkTimeString), reqBody.remark, reqSession.user.userName, Date.now(), reqBody.ticketID, reqBody.remarkIndex);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
exports.deleteParkingTicketRemark = (ticketID, remarkIndex, reqSession) => {
    const db = sqlite(exports.dbPath);
    const info = db.prepare("update ParkingTicketRemarks" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where ticketID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, Date.now(), ticketID, remarkIndex);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
exports.getParkingTicketStatuses = (ticketID, reqSession) => {
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    const statusRows = db.prepare("select statusIndex, statusDate, statusTime," +
        " statusKey, statusField, statusField2, statusNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " order by statusDate desc, statusTime desc, statusIndex desc")
        .all(ticketID);
    db.close();
    for (const status of statusRows) {
        status.recordType = "status";
        status.statusDateString = dateTimeFns.dateIntegerToString(status.statusDate);
        status.statusTimeString = dateTimeFns.timeIntegerToString(status.statusTime);
        status.canUpdate = exports.canUpdateObject(status, reqSession);
    }
    return statusRows;
};
exports.createParkingTicketStatus = (reqBodyOrObj, reqSession, resolveTicket) => {
    const db = sqlite(exports.dbPath);
    const statusIndexNew = db.prepare("select ifnull(max(statusIndex), 0) as statusIndexMax" +
        " from ParkingTicketStatusLog" +
        " where ticketID = ?")
        .get(reqBodyOrObj.ticketID)
        .statusIndexMax + 1;
    const rightNow = new Date();
    const info = db.prepare("insert into ParkingTicketStatusLog" +
        " (ticketID, statusIndex, statusDate, statusTime, statusKey," +
        " statusField, statusField2, statusNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBodyOrObj.ticketID, statusIndexNew, dateTimeFns.dateToInteger(rightNow), dateTimeFns.dateToTimeInteger(rightNow), reqBodyOrObj.statusKey, reqBodyOrObj.statusField, reqBodyOrObj.statusField2, reqBodyOrObj.statusNote, reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    if (info.changes > 0 && resolveTicket) {
        db.prepare("update ParkingTickets" +
            " set resolvedDate = ?," +
            " recordUpdate_userName = ?," +
            " recordUpdate_timeMillis = ?" +
            " where ticketID = ?" +
            " and resolvedDate is null" +
            " and recordDelete_timeMillis is null")
            .run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), reqBodyOrObj.ticketID);
    }
    db.close();
    return {
        success: (info.changes > 0),
        statusIndex: statusIndexNew
    };
};
exports.updateParkingTicketStatus = (reqBody, reqSession) => {
    const db = sqlite(exports.dbPath);
    const info = db.prepare("update ParkingTicketStatusLog" +
        " set statusDate = ?," +
        " statusTime = ?," +
        " statusKey = ?," +
        " statusField = ?," +
        " statusField2 = ?," +
        " statusNote = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and statusIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateStringToInteger(reqBody.statusDateString), dateTimeFns.timeStringToInteger(reqBody.statusTimeString), reqBody.statusKey, reqBody.statusField, reqBody.statusField2, reqBody.statusNote, reqSession.user.userName, Date.now(), reqBody.ticketID, reqBody.statusIndex);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
exports.deleteParkingTicketStatus = (ticketID, statusIndex, reqSession) => {
    const db = sqlite(exports.dbPath);
    const info = db.prepare("update ParkingTicketStatusLog" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where ticketID = ?" +
        " and statusIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, Date.now(), ticketID, statusIndex);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
exports.getLicencePlates = (queryOptions) => {
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    let sqlParams = [];
    let sqlInnerWhereClause = " where recordDelete_timeMillis is null";
    if (queryOptions.licencePlateNumber && queryOptions.licencePlateNumber !== "") {
        const licencePlateNumberPieces = queryOptions.licencePlateNumber.toLowerCase().split(" ");
        for (const licencePlateNumberPiece of licencePlateNumberPieces) {
            sqlInnerWhereClause += " and instr(lower(licencePlateNumber), ?)";
            sqlParams.push(licencePlateNumberPiece);
        }
    }
    sqlParams = sqlParams.concat(sqlParams);
    let sqlHavingClause = " having 1 = 1";
    if (queryOptions.hasOwnProperty("hasOwnerRecord")) {
        if (queryOptions.hasOwnerRecord) {
            sqlHavingClause += " and hasOwnerRecord = 1";
        }
        else {
            sqlHavingClause += " and hasOwnerRecord = 0";
        }
    }
    if (queryOptions.hasOwnProperty("hasUnresolvedTickets")) {
        if (queryOptions.hasUnresolvedTickets) {
            sqlHavingClause += " and unresolvedTicketCount > 0";
        }
        else {
            sqlHavingClause += " and unresolvedTicketCount = 0";
        }
    }
    const innerSql = "select licencePlateCountry, licencePlateProvince, licencePlateNumber," +
        " sum(unresolvedTicketCountInternal) as unresolvedTicketCount," +
        " cast(sum(hasOwnerRecordInternal) as bit) as hasOwnerRecord from (" +
        "select licencePlateCountry, licencePlateProvince, licencePlateNumber," +
        " 0 as unresolvedTicketCountInternal, 1 as hasOwnerRecordInternal" +
        " from LicencePlateOwners" +
        sqlInnerWhereClause +
        " union" +
        " select licencePlateCountry, licencePlateProvince, licencePlateNumber," +
        " sum(case when resolvedDate is null then 1 else 0 end) as unresolvedTicketCountInternal," +
        " 0 as hasOwnerRecordInternal" +
        " from ParkingTickets" +
        sqlInnerWhereClause +
        " group by licencePlateCountry, licencePlateProvince, licencePlateNumber" +
        ")" +
        " group by licencePlateCountry, licencePlateProvince, licencePlateNumber" +
        sqlHavingClause;
    const count = db.prepare("select ifnull(count(*), 0) as cnt" +
        " from (" + innerSql + ")")
        .get(sqlParams)
        .cnt;
    const rows = db.prepare(innerSql +
        " order by licencePlateNumber, licencePlateProvince, licencePlateCountry" +
        " limit " + queryOptions.limit.toString() +
        " offset " + queryOptions.offset.toString())
        .all(sqlParams);
    db.close();
    return {
        count,
        licencePlates: rows
    };
};
exports.getLicencePlateOwner = (licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore) => {
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    const ownerRecord = exports.getLicencePlateOwnerWithDB(db, licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore);
    db.close();
    return ownerRecord;
};
exports.getAllLicencePlateOwners = (licencePlateCountry, licencePlateProvince, licencePlateNumber) => {
    const db = sqlite(exports.dbPath, {
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
exports.getDistinctLicencePlateOwnerVehicleNCICs = (cutoffDate) => {
    const db = sqlite(exports.dbPath, {
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
