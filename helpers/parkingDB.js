"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite = require("better-sqlite3");
const dbPath = "data/parking.db";
const vehicleFns = require("./vehicleFns");
const dateTimeFns = require("./dateTimeFns");
const configFns = require("./configFns");
function canUpdateObject(obj, reqSession) {
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
}
function getRawRowsColumns(sql, params) {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const stmt = db.prepare(sql);
    stmt.raw(true);
    const rows = stmt.all(params);
    const columns = stmt.columns();
    stmt.raw(false);
    db.close();
    return {
        rows: rows,
        columns: columns
    };
}
exports.getRawRowsColumns = getRawRowsColumns;
function getParkingLocationWithDB(db, locationKey) {
    const location = db.prepare("select locationKey, locationName, locationClassKey, isActive" +
        " from ParkingLocations" +
        " where locationKey = ?")
        .get(locationKey);
    return location;
}
function getLicencePlateOwnerWithDB(db, licencePlateCountry, licencePlateProvince, licencePlateNumber) {
    const licencePlateCountryAlias = configFns.getProperty("licencePlateCountryAliases")[licencePlateCountry] || licencePlateCountry;
    const licencePlateProvinceAlias = (configFns.getProperty("licencePlateProvinceAliases")[licencePlateCountryAlias] || {})[licencePlateProvince] || licencePlateProvince;
    const possibleOwners = db.prepare("select * from LicencePlateOwners" +
        " where recordDelete_timeMillis is null" +
        " and licencePlateNumber = ?")
        .all(licencePlateNumber);
    for (let index = 0; index < possibleOwners.length; index += 1) {
        const possibleOwnerObj = possibleOwners[index];
        const ownerPlateCountryAlias = configFns.getProperty("licencePlateCountryAliases")[possibleOwnerObj.licencePlateCountry] || possibleOwnerObj.licencePlateCountry;
        const ownerPlateProvinceAlias = (configFns.getProperty("licencePlateProvinceAliases")[ownerPlateCountryAlias] || {})[possibleOwnerObj.licencePlateProvince] || possibleOwnerObj.licencePlateProvince;
        if (licencePlateCountryAlias === ownerPlateCountryAlias && licencePlateProvinceAlias === ownerPlateProvinceAlias) {
            possibleOwnerObj.recordDateString = dateTimeFns.dateIntegerToString(possibleOwnerObj.recordDate);
            possibleOwnerObj.driverLicenceExpiryDateString = dateTimeFns.dateIntegerToString(possibleOwnerObj.driverLicenceExpiryDate);
            possibleOwnerObj.vehicleMake = vehicleFns.getMakeFromNCIC(possibleOwnerObj.vehicleNCIC);
            return possibleOwnerObj;
        }
    }
    return null;
}
function getParkingTickets(reqSession, queryOptions) {
    const addCalculatedFieldsFn = function (ele) {
        ele.recordType = "ticket";
        ele.issueDateString = dateTimeFns.dateIntegerToString(ele.issueDate);
        ele.resolvedDateString = dateTimeFns.dateIntegerToString(ele.resolvedDate);
        ele.latestStatus_statusDateString = dateTimeFns.dateIntegerToString(ele.latestStatus_statusDate);
        ele.canUpdate = canUpdateObject(ele, reqSession);
    };
    const db = sqlite(dbPath, {
        readonly: true
    });
    const sqlParams = [];
    let sqlWhereClause = " where t.recordDelete_timeMillis is null";
    if (queryOptions.hasOwnProperty("isResolved")) {
        if (queryOptions.isResolved) {
            sqlWhereClause += " and t.resolvedDate is not null";
        }
        else {
            sqlWhereClause += " and t.resolvedDate is null";
        }
    }
    if (queryOptions.ticketNumber && queryOptions.ticketNumber !== "") {
        const ticketNumberPieces = queryOptions.ticketNumber.toLowerCase().split(" ");
        for (let index = 0; index < ticketNumberPieces.length; index += 1) {
            sqlWhereClause += " and instr(lower(t.ticketNumber), ?)";
            sqlParams.push(ticketNumberPieces[index]);
        }
    }
    if (queryOptions.licencePlateNumber && queryOptions.licencePlateNumber !== "") {
        const licencePlateNumberPieces = queryOptions.licencePlateNumber.toLowerCase().split(" ");
        for (let index = 0; index < licencePlateNumberPieces.length; index += 1) {
            sqlWhereClause += " and instr(lower(t.licencePlateNumber), ?)";
            sqlParams.push(licencePlateNumberPieces[index]);
        }
    }
    if (queryOptions.location && queryOptions.location !== "") {
        const locationPieces = queryOptions.location.toLowerCase().split(" ");
        for (let index = 0; index < locationPieces.length; index += 1) {
            sqlWhereClause += " and (instr(lower(t.locationDescription), ?) or instr(lower(l.locationName), ?))";
            sqlParams.push(locationPieces[index]);
            sqlParams.push(locationPieces[index]);
        }
    }
    const count = db.prepare("select ifnull(count(*), 0) as cnt" +
        " from ParkingTickets t" +
        " left join ParkingLocations l on t.locationKey = l.locationKey" +
        sqlWhereClause)
        .get(sqlParams)
        .cnt;
    const rows = db.prepare("select t.ticketID, t.ticketNumber, t.issueDate," +
        " t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber," +
        " t.locationKey, l.locationName, l.locationClassKey, t.locationDescription," +
        " t.parkingOffence, t.offenceAmount, t.resolvedDate," +
        " s.statusDate as latestStatus_statusDate," +
        " s.statusKey as latestStatus_statusKey," +
        " t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis" +
        " from ParkingTickets t" +
        " left join ParkingLocations l on t.locationKey = l.locationKey" +
        (" left join ParkingTicketStatusLog s on t.ticketID = s.ticketID" +
            " and s.statusIndex = (select statusIndex from ParkingTicketStatusLog s where t.ticketID = s.ticketID order by s.statusDate desc, s.statusTime desc, s.statusIndex desc limit 1)") +
        sqlWhereClause +
        " order by t.issueDate desc, t.ticketNumber desc" +
        " limit " + queryOptions.limit +
        " offset " + queryOptions.offset)
        .all(sqlParams);
    db.close();
    rows.forEach(addCalculatedFieldsFn);
    return {
        count: count,
        tickets: rows
    };
}
exports.getParkingTickets = getParkingTickets;
function getParkingTicketsByLicencePlate(licencePlateCountry, licencePlateProvince, licencePlateNumber, reqSession) {
    const addCalculatedFieldsFn = function (ele) {
        ele.recordType = "ticket";
        ele.issueDateString = dateTimeFns.dateIntegerToString(ele.issueDate);
        ele.resolvedDateString = dateTimeFns.dateIntegerToString(ele.resolvedDate);
        ele.latestStatus_statusDateString = dateTimeFns.dateIntegerToString(ele.latestStatus_statusDate);
        ele.canUpdate = canUpdateObject(ele, reqSession);
    };
    const db = sqlite(dbPath, {
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
        (" left join ParkingTicketStatusLog s on t.ticketID = s.ticketID" +
            " and s.statusIndex = (select statusIndex from ParkingTicketStatusLog s where t.ticketID = s.ticketID order by s.statusDate desc, s.statusTime desc, s.statusIndex desc limit 1)") +
        " where t.recordDelete_timeMillis is null" +
        " and t.licencePlateCountry = ?" +
        " and t.licencePlateProvince = ?" +
        " and t.licencePlateNumber = ?" +
        " order by t.issueDate desc, t.ticketNumber desc")
        .all(licencePlateCountry, licencePlateProvince, licencePlateNumber);
    db.close();
    tickets.forEach(addCalculatedFieldsFn);
    return tickets;
}
exports.getParkingTicketsByLicencePlate = getParkingTicketsByLicencePlate;
function getParkingTicket(ticketID, reqSession) {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const ticket = db.prepare("select * from ParkingTickets" +
        " where ticketID = ?")
        .get(ticketID);
    if (!ticket) {
        db.close();
        return ticket;
    }
    ticket.recordType = "ticket";
    ticket.issueDateString = dateTimeFns.dateIntegerToString(ticket.issueDate);
    ticket.issueTimeString = dateTimeFns.timeIntegerToString(ticket.issueTime);
    ticket.resolvedDateString = dateTimeFns.dateIntegerToString(ticket.resolvedDate);
    ticket.canUpdate = canUpdateObject(ticket, reqSession);
    ticket.licencePlateOwner = getLicencePlateOwnerWithDB(db, ticket.licencePlateCountry, ticket.licencePlateProvince, ticket.licencePlateNumber);
    ticket.location = getParkingLocationWithDB(db, ticket.locationKey);
    ticket.statusLog = db.prepare("select * from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " order by statusDate desc, statusTime desc, statusIndex desc")
        .all(ticketID);
    for (let index = 0; index < ticket.statusLog.length; index += 1) {
        const statusObj = ticket.statusLog[index];
        statusObj.statusDateString = dateTimeFns.dateIntegerToString(statusObj.statusDate);
        statusObj.statusTimeString = dateTimeFns.timeIntegerToString(statusObj.statusTime);
        if (!ticket.canUpdate) {
            statusObj.canUpdate = false;
        }
        else {
            statusObj.canUpdate = canUpdateObject(statusObj, reqSession);
        }
    }
    ticket.remarks = db.prepare("select * from ParkingTicketRemarks" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " order by remarkDate desc, remarkTime desc, remarkIndex desc")
        .all(ticketID);
    for (let index = 0; index < ticket.remarks.length; index += 1) {
        const remarkObj = ticket.remarks[index];
        remarkObj.remarkDateString = dateTimeFns.dateIntegerToString(remarkObj.remarkDate);
        remarkObj.remarkTimeString = dateTimeFns.timeIntegerToString(remarkObj.remarkTime);
        if (!ticket.canUpdate) {
            remarkObj.canUpdate = false;
        }
        else {
            remarkObj.canUpdate = canUpdateObject(remarkObj, reqSession);
        }
    }
    db.close();
    return ticket;
}
exports.getParkingTicket = getParkingTicket;
function createParkingTicket(reqBody, reqSession) {
    const db = sqlite(dbPath);
    const nowMillis = Date.now();
    const issueDate = dateTimeFns.dateStringToInteger(reqBody.issueDateString);
    if (configFns.getProperty("parkingTickets.ticketNumber.isUnique")) {
        const duplicateTicket = db.prepare("select ticketID from ParkingTickets" +
            " where recordDelete_timeMillis is null" +
            " and ticketNumber = ?" +
            " and abs(issueDate - ?) <= 20000")
            .get(reqBody.ticketNumber, issueDate);
        if (duplicateTicket) {
            db.close();
            return {
                success: false,
                message: "A ticket with the same ticket number was seen in the last two years."
            };
        }
    }
    const info = db.prepare("insert into ParkingTickets" +
        " (ticketNumber, issueDate, issueTime, issuingOfficer," +
        " locationKey, locationDescription," +
        " bylawNumber, parkingOffence, offenceAmount," +
        " licencePlateCountry, licencePlateProvince, licencePlateNumber, vehicleMakeModel," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.ticketNumber, issueDate, dateTimeFns.timeStringToInteger(reqBody.issueTimeString), reqBody.issuingOfficer, reqBody.locationKey, reqBody.locationDescription, reqBody.bylawNumber, reqBody.parkingOffence, reqBody.offenceAmount, reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumber, reqBody.vehicleMakeModel, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    db.close();
    return {
        success: true,
        ticketID: info.lastInsertRowid,
        nextTicketNumber: ""
    };
}
exports.createParkingTicket = createParkingTicket;
function updateParkingTicket(reqBody, reqSession) {
    const db = sqlite(dbPath);
    const nowMillis = Date.now();
    const issueDate = dateTimeFns.dateStringToInteger(reqBody.issueDateString);
    if (configFns.getProperty("parkingTickets.ticketNumber.isUnique")) {
        const duplicateTicket = db.prepare("select ticketID from ParkingTickets" +
            " where recordDelete_timeMillis is null" +
            " and ticketNumber = ?" +
            " and ticketID != ?" +
            " and abs(issueDate - ?) <= 20000")
            .get(reqBody.ticketNumber, reqBody.ticketID, issueDate);
        if (duplicateTicket) {
            db.close();
            return {
                success: false,
                message: "A ticket with the same ticket number was seen in the last two years."
            };
        }
    }
    const info = db.prepare("update ParkingTickets" +
        " set ticketNumber = ?," +
        " issueDate = ?," +
        " issueTime = ?," +
        " issuingOfficer = ?," +
        " locationKey = ?," +
        " locationDescription = ?," +
        " bylawNumber = ?," +
        " parkingOffence = ?," +
        " offenceAmount = ?," +
        " licencePlateCountry = ?," +
        " licencePlateProvince = ?," +
        " licencePlateNumber = ?," +
        " vehicleMakeModel = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and resolvedDate is null" +
        " and recordDelete_timeMillis is null")
        .run(reqBody.ticketNumber, issueDate, dateTimeFns.timeStringToInteger(reqBody.issueTimeString), reqBody.issuingOfficer, reqBody.locationKey, reqBody.locationDescription, reqBody.bylawNumber, reqBody.parkingOffence, reqBody.offenceAmount, reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumber, reqBody.vehicleMakeModel, reqSession.user.userName, nowMillis, reqBody.ticketID);
    db.close();
    if (info.changes) {
        return {
            success: true
        };
    }
    else {
        return {
            success: false,
            message: "An error occurred saving this ticket.  Please try again."
        };
    }
}
exports.updateParkingTicket = updateParkingTicket;
function deleteParkingTicket(ticketID, reqSession) {
    const db = sqlite(dbPath);
    const info = db.prepare("update ParkingTickets" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where ticketID = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, Date.now(), ticketID);
    db.close();
    return {
        success: (info.changes > 0)
    };
}
exports.deleteParkingTicket = deleteParkingTicket;
function resolveParkingTicket(ticketID, reqSession) {
    const db = sqlite(dbPath);
    const rightNow = new Date();
    const info = db.prepare("update ParkingTickets" +
        " set resolvedDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and resolvedDate is null" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), ticketID);
    db.close();
    return {
        success: (info.changes > 0)
    };
}
exports.resolveParkingTicket = resolveParkingTicket;
function unresolveParkingTicket(ticketID, reqSession) {
    const db = sqlite(dbPath);
    const ticketObj = db.prepare("select recordUpdate_timeMillis from ParkingTickets" +
        " where ticketID = ?" +
        " and recordDelete_timeMillis is null" +
        " and resolvedDate is not null")
        .get(ticketID);
    if (!ticketObj) {
        db.close();
        return {
            success: false,
            message: "The ticket has either been deleted, or is no longer marked as resolved."
        };
    }
    else if (ticketObj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") < Date.now()) {
        db.close();
        return {
            success: false,
            message: "The ticket is outside of the window for removing the resolved status."
        };
    }
    const info = db.prepare("update ParkingTickets" +
        " set resolvedDate = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and resolvedDate is not null" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, Date.now(), ticketID);
    db.close();
    return {
        success: (info.changes > 0)
    };
}
exports.unresolveParkingTicket = unresolveParkingTicket;
function getRecentParkingTicketVehicleMakeModelValues() {
    const db = sqlite(dbPath, {
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
    for (let index = 0; index < rows.length; index += 1) {
        vehicleMakeModelList.push(rows[index].vehicleMakeModel);
    }
    return vehicleMakeModelList;
}
exports.getRecentParkingTicketVehicleMakeModelValues = getRecentParkingTicketVehicleMakeModelValues;
function getParkingTicketRemarks(ticketID, reqSession) {
    const addCalculatedFieldsFn = function (remark) {
        remark.recordType = "remark";
        remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate);
        remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime);
        remark.canUpdate = canUpdateObject(remark, reqSession);
    };
    const db = sqlite(dbPath, {
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
    remarkRows.forEach(addCalculatedFieldsFn);
    return remarkRows;
}
exports.getParkingTicketRemarks = getParkingTicketRemarks;
function createParkingTicketRemark(reqBody, reqSession) {
    const db = sqlite(dbPath);
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
}
exports.createParkingTicketRemark = createParkingTicketRemark;
function updateParkingTicketRemark(reqBody, reqSession) {
    const db = sqlite(dbPath);
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
}
exports.updateParkingTicketRemark = updateParkingTicketRemark;
function deleteParkingTicketRemark(ticketID, remarkIndex, reqSession) {
    const db = sqlite(dbPath);
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
}
exports.deleteParkingTicketRemark = deleteParkingTicketRemark;
function getParkingTicketStatuses(ticketID, reqSession) {
    const addCalculatedFieldsFn = function (status) {
        status.recordType = "status";
        status.statusDateString = dateTimeFns.dateIntegerToString(status.statusDate);
        status.statusTimeString = dateTimeFns.timeIntegerToString(status.statusTime);
        status.canUpdate = canUpdateObject(status, reqSession);
    };
    const db = sqlite(dbPath, {
        readonly: true
    });
    const statusRows = db.prepare("select statusIndex, statusDate, statusTime," +
        " statusKey, statusField, statusNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " order by statusDate desc, statusTime desc, statusIndex desc")
        .all(ticketID);
    db.close();
    statusRows.forEach(addCalculatedFieldsFn);
    return statusRows;
}
exports.getParkingTicketStatuses = getParkingTicketStatuses;
function createParkingTicketStatus(reqBody, reqSession, resolveTicket) {
    const db = sqlite(dbPath);
    const statusIndexNew = db.prepare("select ifnull(max(statusIndex), 0) as statusIndexMax" +
        " from ParkingTicketStatusLog" +
        " where ticketID = ?")
        .get(reqBody.ticketID)
        .statusIndexMax + 1;
    const rightNow = new Date();
    const info = db.prepare("insert into ParkingTicketStatusLog" +
        " (ticketID, statusIndex, statusDate, statusTime, statusKey," +
        " statusField, statusNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.ticketID, statusIndexNew, dateTimeFns.dateToInteger(rightNow), dateTimeFns.dateToTimeInteger(rightNow), reqBody.statusKey, reqBody.statusField, reqBody.statusNote, reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    if (info.changes > 0 && resolveTicket) {
        db.prepare("update ParkingTickets" +
            " set resolvedDate = ?," +
            " recordUpdate_userName = ?," +
            " recordUpdate_timeMillis = ?" +
            " where ticketID = ?" +
            " and resolvedDate is null" +
            " and recordDelete_timeMillis is null")
            .run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), reqBody.ticketID);
    }
    db.close();
    return {
        success: (info.changes > 0)
    };
}
exports.createParkingTicketStatus = createParkingTicketStatus;
function updateParkingTicketStatus(reqBody, reqSession) {
    const db = sqlite(dbPath);
    const info = db.prepare("update ParkingTicketStatusLog" +
        " set statusDate = ?," +
        " statusTime = ?," +
        " statusKey = ?," +
        " statusField = ?," +
        " statusNote = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and statusIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateStringToInteger(reqBody.statusDateString), dateTimeFns.timeStringToInteger(reqBody.statusTimeString), reqBody.statusKey, reqBody.statusField, reqBody.statusNote, reqSession.user.userName, Date.now(), reqBody.ticketID, reqBody.statusIndex);
    db.close();
    return {
        success: (info.changes > 0)
    };
}
exports.updateParkingTicketStatus = updateParkingTicketStatus;
function deleteParkingTicketStatus(ticketID, statusIndex, reqSession) {
    const db = sqlite(dbPath);
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
}
exports.deleteParkingTicketStatus = deleteParkingTicketStatus;
function getLicencePlates(queryOptions) {
    const db = sqlite(dbPath, {
        readonly: true
    });
    let sqlParams = [];
    let sqlInnerWhereClause = " where recordDelete_timeMillis is null";
    if (queryOptions.licencePlateNumber && queryOptions.licencePlateNumber !== "") {
        const licencePlateNumberPieces = queryOptions.licencePlateNumber.toLowerCase().split(" ");
        for (let index = 0; index < licencePlateNumberPieces.length; index += 1) {
            sqlInnerWhereClause += " and instr(lower(licencePlateNumber), ?)";
            sqlParams.push(licencePlateNumberPieces[index]);
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
        " sum(case when resolvedDate is null then 1 else 0 end) as unresolvedTicketCountInternal, 0 as hasOwnerRecordInternal" +
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
        " limit " + queryOptions.limit +
        " offset " + queryOptions.offset)
        .all(sqlParams);
    db.close();
    return {
        count: count,
        licencePlates: rows
    };
}
exports.getLicencePlates = getLicencePlates;
function getLicencePlateOwner(licencePlateCountry, licencePlateProvince, licencePlateNumber) {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const ownerRecord = getLicencePlateOwnerWithDB(db, licencePlateCountry, licencePlateProvince, licencePlateNumber);
    db.close();
    return ownerRecord;
}
exports.getLicencePlateOwner = getLicencePlateOwner;
function getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate) {
    const db = sqlite(dbPath, {
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
}
exports.getDistinctLicencePlateOwnerVehicleNCICs = getDistinctLicencePlateOwnerVehicleNCICs;
function getParkingLocations() {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const rows = db.prepare("select locationKey, locationName, locationClassKey" +
        " from ParkingLocations" +
        " where isActive = 1" +
        " order by orderNumber, locationName")
        .all();
    db.close();
    return rows;
}
exports.getParkingLocations = getParkingLocations;
function getParkingOffences(locationKey) {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const rows = db.prepare("select o.bylawNumber, b.bylawDescription," +
        " o.parkingOffence, o.offenceAmount" +
        " from ParkingOffences o" +
        " left join ParkingBylaws b on o.bylawNumber = b.bylawNumber" +
        " where o.isActive = 1 and b.isActive = 1" +
        " and o.locationKey = ?" +
        " order by b.orderNumber, b.bylawNumber")
        .all(locationKey);
    db.close();
    return rows;
}
exports.getParkingOffences = getParkingOffences;
function getLicencePlateLookupBatch(batchID_or_negOne) {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const baseBatchSQL = "select batchID, batchDate, lockDate, sentDate, receivedDate," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from LicencePlateLookupBatches" +
        " where recordDelete_timeMillis is null";
    let batch;
    if (batchID_or_negOne == -1) {
        batch = db.prepare(baseBatchSQL +
            " and lockDate is null" +
            " order by batchID desc" +
            " limit 1")
            .get();
    }
    else {
        batch = db.prepare(baseBatchSQL +
            " and batchID = ?")
            .get(batchID_or_negOne);
    }
    if (!batch) {
        return null;
    }
    batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
    batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
    batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
    batch.receivedDateString = dateTimeFns.dateIntegerToString(batch.receivedDate);
    batch.batchEntries = db.prepare("select e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber," +
        " e.ticketID, t.ticketNumber" +
        " from LicencePlateLookupBatchEntries e" +
        " left join ParkingTickets t on e.ticketID = t.ticketID" +
        " where e.batchID = ?" +
        " order by e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber")
        .all(batch.batchID);
    db.close();
    return batch;
}
exports.getLicencePlateLookupBatch = getLicencePlateLookupBatch;
function getUnsentLicencePlateLookupBatches() {
    const addCalculatedFieldsFn = function (batch) {
        batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
        batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
    };
    const db = sqlite(dbPath, {
        readonly: true
    });
    const batches = db.prepare("select b.batchID, b.batchDate, b.lockDate, count(e.batchID) as batchEntryCount" +
        " from LicencePlateLookupBatches b" +
        " left join LicencePlateLookupBatchEntries e on b.batchID = e.batchID" +
        " where b.recordDelete_timeMillis is null" +
        " and b.sentDate is null" +
        " group by b.batchID, b.batchDate, b.lockDate" +
        " order by b.batchID desc")
        .all();
    db.close();
    batches.forEach(addCalculatedFieldsFn);
    return batches;
}
exports.getUnsentLicencePlateLookupBatches = getUnsentLicencePlateLookupBatches;
function createLicencePlateLookupBatch(reqSession) {
    const db = sqlite(dbPath);
    const rightNow = new Date();
    const info = db.prepare("insert into LicencePlateLookupBatches" +
        " (batchDate, recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?)")
        .run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    if (info.changes > 0) {
        return {
            success: true,
            batch: {
                batchID: info.lastInsertRowid,
                batchDate: dateTimeFns.dateToInteger(rightNow),
                batchDateString: dateTimeFns.dateToString(rightNow),
                lockDate: null,
                lockDateString: "",
                batchEntries: []
            }
        };
    }
    else {
        return { success: false };
    }
}
exports.createLicencePlateLookupBatch = createLicencePlateLookupBatch;
function getParkingTicketsForLookupBatch(includeBatchID) {
}
exports.getParkingTicketsForLookupBatch = getParkingTicketsForLookupBatch;
