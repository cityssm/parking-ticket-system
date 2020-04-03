"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite = require("better-sqlite3");
exports.dbPath = "data/parking.db";
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
    const db = sqlite(exports.dbPath, {
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
function getLicencePlateOwnerWithDB(db, licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore) {
    const licencePlateCountryAlias = configFns.getProperty("licencePlateCountryAliases")[licencePlateCountry] || licencePlateCountry;
    const licencePlateProvinceAlias = (configFns.getProperty("licencePlateProvinceAliases")[licencePlateCountryAlias] || {})[licencePlateProvince] || licencePlateProvince;
    const possibleOwners = db.prepare("select * from LicencePlateOwners" +
        " where recordDelete_timeMillis is null" +
        " and licencePlateNumber = ?" +
        " and recordDate >= ?" +
        " order by recordDate")
        .all(licencePlateNumber, recordDateOrBefore);
    for (let index = 0; index < possibleOwners.length; index += 1) {
        const possibleOwnerObj = possibleOwners[index];
        const ownerPlateCountryAlias = configFns.getProperty("licencePlateCountryAliases")[possibleOwnerObj.licencePlateCountry] || possibleOwnerObj.licencePlateCountry;
        const ownerPlateProvinceAlias = (configFns.getProperty("licencePlateProvinceAliases")[ownerPlateCountryAlias] || {})[possibleOwnerObj.licencePlateProvince] || possibleOwnerObj.licencePlateProvince;
        if (licencePlateCountryAlias === ownerPlateCountryAlias && licencePlateProvinceAlias === ownerPlateProvinceAlias) {
            possibleOwnerObj.recordDateString = dateTimeFns.dateIntegerToString(possibleOwnerObj.recordDate);
            possibleOwnerObj.licencePlateExpiryDateString = dateTimeFns.dateIntegerToString(possibleOwnerObj.licencePlateExpiryDate);
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
    const db = sqlite(exports.dbPath, {
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
    const db = sqlite(exports.dbPath, {
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
    ticket.licencePlateOwner = getLicencePlateOwnerWithDB(db, ticket.licencePlateCountry, ticket.licencePlateProvince, ticket.licencePlateNumber, ticket.issueDate);
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
function getParkingTicketID(ticketNumber) {
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
}
exports.getParkingTicketID = getParkingTicketID;
function createParkingTicket(reqBody, reqSession) {
    const db = sqlite(exports.dbPath);
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
    const db = sqlite(exports.dbPath);
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
    const db = sqlite(exports.dbPath);
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
    const db = sqlite(exports.dbPath);
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
    const db = sqlite(exports.dbPath);
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
    remarkRows.forEach(addCalculatedFieldsFn);
    return remarkRows;
}
exports.getParkingTicketRemarks = getParkingTicketRemarks;
function createParkingTicketRemark(reqBody, reqSession) {
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
}
exports.createParkingTicketRemark = createParkingTicketRemark;
function updateParkingTicketRemark(reqBody, reqSession) {
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
}
exports.updateParkingTicketRemark = updateParkingTicketRemark;
function deleteParkingTicketRemark(ticketID, remarkIndex, reqSession) {
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
}
exports.deleteParkingTicketRemark = deleteParkingTicketRemark;
function getParkingTicketStatuses(ticketID, reqSession) {
    const addCalculatedFieldsFn = function (status) {
        status.recordType = "status";
        status.statusDateString = dateTimeFns.dateIntegerToString(status.statusDate);
        status.statusTimeString = dateTimeFns.timeIntegerToString(status.statusTime);
        status.canUpdate = canUpdateObject(status, reqSession);
    };
    const db = sqlite(exports.dbPath, {
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
function createParkingTicketStatus(reqBodyOrObj, reqSession, resolveTicket) {
    const db = sqlite(exports.dbPath);
    const statusIndexNew = db.prepare("select ifnull(max(statusIndex), 0) as statusIndexMax" +
        " from ParkingTicketStatusLog" +
        " where ticketID = ?")
        .get(reqBodyOrObj.ticketID)
        .statusIndexMax + 1;
    const rightNow = new Date();
    const info = db.prepare("insert into ParkingTicketStatusLog" +
        " (ticketID, statusIndex, statusDate, statusTime, statusKey," +
        " statusField, statusNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBodyOrObj.ticketID, statusIndexNew, dateTimeFns.dateToInteger(rightNow), dateTimeFns.dateToTimeInteger(rightNow), reqBodyOrObj.statusKey, reqBodyOrObj.statusField, reqBodyOrObj.statusNote, reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
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
}
exports.createParkingTicketStatus = createParkingTicketStatus;
function updateParkingTicketStatus(reqBody, reqSession) {
    const db = sqlite(exports.dbPath);
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
}
exports.deleteParkingTicketStatus = deleteParkingTicketStatus;
function getLicencePlates(queryOptions) {
    const db = sqlite(exports.dbPath, {
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
function getLicencePlateOwner(licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore) {
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    const ownerRecord = getLicencePlateOwnerWithDB(db, licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore);
    db.close();
    return ownerRecord;
}
exports.getLicencePlateOwner = getLicencePlateOwner;
function getAllLicencePlateOwners(licencePlateCountry, licencePlateProvince, licencePlateNumber) {
    const addCalculatedFieldsFn = function (record) {
        record.recordDateString = dateTimeFns.dateIntegerToString(record.recordDate);
        record.vehicleMake = vehicleFns.getMakeFromNCIC(record.vehicleNCIC);
    };
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
    owners.forEach(addCalculatedFieldsFn);
    return owners;
}
exports.getAllLicencePlateOwners = getAllLicencePlateOwners;
function getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate) {
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
}
exports.getDistinctLicencePlateOwnerVehicleNCICs = getDistinctLicencePlateOwnerVehicleNCICs;
function getParkingLocations() {
    const db = sqlite(exports.dbPath, {
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
    const db = sqlite(exports.dbPath, {
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
    const db = sqlite(exports.dbPath, {
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
        " e.ticketID, t.ticketNumber, t.issueDate" +
        " from LicencePlateLookupBatchEntries e" +
        " left join ParkingTickets t on e.ticketID = t.ticketID" +
        " where e.batchID = ?" +
        " order by e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber")
        .all(batch.batchID);
    db.close();
    return batch;
}
exports.getLicencePlateLookupBatch = getLicencePlateLookupBatch;
function addLicencePlateToLookupBatch(reqBody, reqSession) {
    const db = sqlite(exports.dbPath);
    const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
        " set recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where batchID = ?" +
        " and recordDelete_timeMillis is null" +
        " and lockDate is null")
        .run(reqSession.user.userName, Date.now(), reqBody.batchID).changes;
    if (canUpdateBatch === 0) {
        db.close();
        return {
            success: false,
            message: "Batch cannot be updated."
        };
    }
    const info = db.prepare("insert or ignore into LicencePlateLookupBatchEntries" +
        " (batchID, licencePlateCountry, licencePlateProvince, licencePlateNumber, ticketID)" +
        " values (?, ?, ?, ?, ?)")
        .run(reqBody.batchID, reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumber, reqBody.ticketID);
    db.close();
    if (info.changes > 0) {
        return {
            success: true
        };
    }
    else {
        return {
            success: false,
            message: "Licence plate not added to the batch.  It may be already part of the batch."
        };
    }
}
exports.addLicencePlateToLookupBatch = addLicencePlateToLookupBatch;
function addAllLicencePlatesToLookupBatch(reqBody, reqSession) {
    const db = sqlite(exports.dbPath);
    const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
        " set recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where batchID = ?" +
        " and recordDelete_timeMillis is null" +
        " and lockDate is null")
        .run(reqSession.user.userName, Date.now(), reqBody.batchID).changes;
    if (canUpdateBatch === 0) {
        db.close();
        return {
            success: false,
            message: "Batch cannot be updated."
        };
    }
    const insertStmt = db.prepare("insert or ignore into LicencePlateLookupBatchEntries" +
        " (batchID, licencePlateCountry, licencePlateProvince, licencePlateNumber, ticketID)" +
        " values (?, ?, ?, ?, ?)");
    let changeCount = 0;
    for (let index = 0; index < reqBody.licencePlateNumbers.length; index += 1) {
        const info = insertStmt
            .run(reqBody.batchID, reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumbers[index][0], reqBody.licencePlateNumbers[index][1]);
        changeCount += info.changes;
    }
    db.close();
    if (changeCount > 0) {
        return {
            success: true,
            batch: getLicencePlateLookupBatch(reqBody.batchID)
        };
    }
    else {
        return {
            success: false,
            message: "Licence plate not added to the batch.  It may be already part of the batch."
        };
    }
}
exports.addAllLicencePlatesToLookupBatch = addAllLicencePlatesToLookupBatch;
function removeLicencePlateFromLookupBatch(reqBody, reqSession) {
    const db = sqlite(exports.dbPath);
    const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
        " set recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where batchID = ?" +
        " and recordDelete_timeMillis is null" +
        " and lockDate is null")
        .run(reqSession.user.userName, Date.now(), reqBody.batchID).changes;
    if (canUpdateBatch === 0) {
        db.close();
        return {
            success: false,
            message: "Batch cannot be updated."
        };
    }
    const info = db.prepare("delete from LicencePlateLookupBatchEntries" +
        " where batchID = ?" +
        " and licencePlateCountry = ?" +
        " and licencePlateProvince = ?" +
        " and licencePlateNumber = ?")
        .run(reqBody.batchID, reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumber);
    db.close();
    if (info.changes > 0) {
        return {
            success: true
        };
    }
    else {
        return {
            success: false,
            message: "Licence plate not removed from the batch."
        };
    }
}
exports.removeLicencePlateFromLookupBatch = removeLicencePlateFromLookupBatch;
function clearLookupBatch(batchID, reqSession) {
    const db = sqlite(exports.dbPath);
    const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
        " set recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where batchID = ?" +
        " and recordDelete_timeMillis is null" +
        " and lockDate is null")
        .run(reqSession.user.userName, Date.now(), batchID).changes;
    if (canUpdateBatch === 0) {
        db.close();
        return {
            success: false,
            message: "Batch cannot be updated."
        };
    }
    db.prepare("delete from LicencePlateLookupBatchEntries" +
        " where batchID = ?")
        .run(batchID);
    db.close();
    return {
        success: true
    };
}
exports.clearLookupBatch = clearLookupBatch;
function lockLookupBatch(batchID, reqSession) {
    const db = sqlite(exports.dbPath);
    const rightNow = new Date();
    const info = db.prepare("update LicencePlateLookupBatches" +
        " set lockDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where batchID = ?" +
        " and recordDelete_timeMillis is null" +
        " and lockDate is null")
        .run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), batchID);
    if (info.changes > 0) {
        db.prepare("insert into ParkingTicketStatusLog" +
            " (ticketID, statusIndex, statusDate, statusTime, statusKey, statusField, statusNote," +
            " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
            " select t.ticketID," +
            " ifnull(max(s.statusIndex), 0) + 1 as statusIndex," +
            " ? as statusDate," +
            " ? as statusTime," +
            " 'ownerLookupPending' as statusKey," +
            " e.batchID as statusField," +
            " 'Looking up '||e.licencePlateNumber||' '||e.licencePlateProvince||' '||e.licencePlateCountry as statusNote," +
            " ? as recordCreate_userName," +
            " ? as recordCreate_timeMillis," +
            " ? as recordUpdate_userName," +
            " ? as recordUpdate_timeMillis" +
            " from LicencePlateLookupBatchEntries e" +
            " left join ParkingTickets t" +
            " on e.licencePlateCountry = t.licencePlateCountry" +
            " and e.licencePlateProvince = t.licencePlateProvince" +
            " and e.licencePlateNumber = t.licencePlateNumber" +
            " left join ParkingTicketStatusLog s on t.ticketID = s.ticketID" +
            " where e.batchID = ?" +
            " and (e.ticketID = t.ticketID or (t.recordDelete_timeMillis is null and t.resolvedDate is null))" +
            " group by t.ticketID, e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber, e.batchID" +
            " having max(" +
            "case when s.statusKey in ('ownerLookupPending', 'ownerLookupMatch', 'ownerLookupError') and s.recordDelete_timeMillis is null then 1" +
            " else 0" +
            " end) = 0")
            .run(dateTimeFns.dateToInteger(rightNow), dateTimeFns.dateToTimeInteger(rightNow), reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime(), batchID);
    }
    db.close();
    return {
        success: (info.changes > 0)
    };
}
exports.lockLookupBatch = lockLookupBatch;
function markLookupBatchAsSent(batchID, reqSession) {
    const db = sqlite(exports.dbPath);
    const rightNow = new Date();
    const info = db.prepare("update LicencePlateLookupBatches" +
        " set sentDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where batchID = ?" +
        " and recordDelete_timeMillis is null" +
        " and lockDate is not null" +
        " and sentDate is null")
        .run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), batchID);
    db.close();
    return (info.changes > 0);
}
exports.markLookupBatchAsSent = markLookupBatchAsSent;
function getUnreceivedLicencePlateLookupBatches(includeUnlocked) {
    const addCalculatedFieldsFn = function (batch) {
        batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
        batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
        batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
    };
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    const batches = db.prepare("select b.batchID, b.batchDate, b.lockDate, b.sentDate, count(e.batchID) as batchEntryCount" +
        " from LicencePlateLookupBatches b" +
        " left join LicencePlateLookupBatchEntries e on b.batchID = e.batchID" +
        " where b.recordDelete_timeMillis is null" +
        " and b.receivedDate is null" +
        (includeUnlocked ? "" : " and b.lockDate is not null") +
        " group by b.batchID, b.batchDate, b.lockDate, b.sentDate" +
        " order by b.batchID desc")
        .all();
    db.close();
    batches.forEach(addCalculatedFieldsFn);
    return batches;
}
exports.getUnreceivedLicencePlateLookupBatches = getUnreceivedLicencePlateLookupBatches;
function createLicencePlateLookupBatch(reqSession) {
    const db = sqlite(exports.dbPath);
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
function mto_getLicencePlatesAvailableForLookupBatch(currentBatchID, issueDaysAgo) {
    const addCalculatedFieldsFn = function (plateRecord) {
        plateRecord.issueDateMinString = dateTimeFns.dateIntegerToString(plateRecord.issueDateMin);
        plateRecord.issueDateMaxString = dateTimeFns.dateIntegerToString(plateRecord.issueDateMax);
        plateRecord.ticketNumbers = plateRecord.ticketNumbersConcat.split(":");
        delete plateRecord.ticketNumbersConcat;
    };
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    let issueDateNumber = 99999999;
    if (issueDaysAgo !== -1) {
        let issueDate = new Date();
        issueDate.setDate(issueDate.getDate() - issueDaysAgo);
        issueDateNumber = dateTimeFns.dateToInteger(issueDate);
    }
    const plates = db.prepare("select t.licencePlateNumber," +
        " min(t.ticketID) as ticketIDMin," +
        " count(t.ticketID) as ticketCount," +
        " group_concat(t.ticketNumber, ':') as ticketNumbersConcat," +
        " min(t.issueDate) as issueDateMin," +
        " max(t.issueDate) as issueDateMax" +
        " from ParkingTickets t" +
        " left join LicencePlateLookupBatchEntries e on t.licencePlateNumber = e.licencePlateNumber and (t.ticketID = e.ticketID or e.batchID = ?)" +
        " where t.recordDelete_timeMillis is null" +
        " and t.licencePlateCountry = 'CA'" +
        " and t.licencePlateProvince = 'ON'" +
        " and t.licencePlateNumber != ''" +
        " and t.resolvedDate is null" +
        " and e.batchID is null" +
        (" and not exists (" +
            "select 1 from ParkingTicketStatusLog s" +
            " where t.ticketID = s.ticketID and s.recordDelete_timeMillis is null" +
            " and s.statusKey in ('ownerLookupPending', 'ownerLookupMatch', 'ownerLookupError'))") +
        " and t.issueDate <= ?" +
        " group by t.licencePlateNumber" +
        " order by t.licencePlateNumber")
        .all(currentBatchID, issueDateNumber);
    db.close();
    plates.forEach(addCalculatedFieldsFn);
    return plates;
}
exports.mto_getLicencePlatesAvailableForLookupBatch = mto_getLicencePlatesAvailableForLookupBatch;
;
function getOwnershipReconciliationRecords() {
    const addCalculatedFieldsFn = function (record) {
        record.ticket_issueDateString = dateTimeFns.dateIntegerToString(record.ticket_issueDate);
        record.owner_recordDateString = dateTimeFns.dateIntegerToString(record.owner_recordDate);
        record.owner_vehicleMake = vehicleFns.getMakeFromNCIC(record.owner_vehicleNCIC);
        record.dateDifference = dateTimeFns.dateStringDifferenceInDays(record.ticket_issueDateString, record.owner_recordDateString);
        record.isProbableMatch =
            (record.ticket_vehicleMakeModel.toLowerCase() === record.owner_vehicleMake.toLowerCase()) ||
                (record.ticket_vehicleMakeModel.toLowerCase() === record.owner_vehicleNCIC.toLowerCase());
    };
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    const records = db.prepare("select t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber," +
        " t.ticketID as ticket_ticketID," +
        " t.ticketNumber as ticket_ticketNumber," +
        " t.issueDate as ticket_issueDate," +
        " t.vehicleMakeModel as ticket_vehicleMakeModel," +
        " o.recordDate as owner_recordDate," +
        " o.vehicleNCIC as owner_vehicleNCIC," +
        " o.vehicleYear as owner_vehicleYear," +
        " o.vehicleColor as owner_vehicleColor," +
        " o.ownerName1 as owner_ownerName1," +
        " o.ownerName2 as owner_ownerName2," +
        " o.ownerAddress as owner_ownerAddress," +
        " o.ownerCity as owner_ownerCity," +
        " o.ownerProvince as owner_ownerProvince," +
        " o.ownerPostalCode as owner_ownerPostalCode" +
        " from ParkingTickets t" +
        (" inner join LicencePlateOwners o" +
            " on t.licencePlateCountry = o.licencePlateCountry" +
            " and t.licencePlateProvince = o.licencePlateProvince" +
            " and t.licencePlateNumber = o.licencePlateNumber" +
            " and o.recordDelete_timeMillis is null" +
            " and o.vehicleNCIC <> ''" +
            (" and o.recordDate = (" +
                "select o2.recordDate from LicencePlateOwners o2" +
                " where t.licencePlateCountry = o2.licencePlateCountry" +
                " and t.licencePlateProvince = o2.licencePlateProvince" +
                " and t.licencePlateNumber = o2.licencePlateNumber" +
                " and o2.recordDelete_timeMillis is null" +
                " and t.issueDate <= o2.recordDate" +
                " order by o2.recordDate" +
                " limit 1)")) +
        " where t.recordDelete_timeMillis is null" +
        " and t.resolvedDate is null" +
        (" and not exists (" +
            "select 1 from ParkingTicketStatusLog s " +
            " where t.ticketID = s.ticketID " +
            " and s.statusKey in ('ownerLookupMatch', 'ownerLookupError')" +
            " and s.recordDelete_timeMillis is null)"))
        .all();
    db.close();
    records.forEach(addCalculatedFieldsFn);
    return records;
}
exports.getOwnershipReconciliationRecords = getOwnershipReconciliationRecords;
;
function getUnacknowledgedLicencePlateLookupErrorLog(batchID_or_negOne, logIndex_or_negOne) {
    const addCalculatedFieldsFn = function (record) {
        record.recordDateString = dateTimeFns.dateIntegerToString(record.recordDate);
        record.issueDateString = dateTimeFns.dateIntegerToString(record.issueDate);
    };
    const db = sqlite(exports.dbPath, {
        readonly: true
    });
    let params = [];
    if (batchID_or_negOne !== -1 && logIndex_or_negOne !== -1) {
        params = [batchID_or_negOne, logIndex_or_negOne];
    }
    const logEntries = db.prepare("select l.batchID, l.logIndex," +
        " l.licencePlateCountry, l.licencePlateProvince, l.licencePlateNumber, l.recordDate," +
        " l.errorCode, l.errorMessage," +
        " e.ticketID, t.ticketNumber, t.issueDate, t.vehicleMakeModel" +
        " from LicencePlateLookupErrorLog l" +
        (" inner join LicencePlateLookupBatches b" +
            " on l.batchID = b.batchID" +
            " and b.recordDelete_timeMillis is null") +
        (" inner join LicencePlateLookupBatchEntries e" +
            " on b.batchID = e.batchID" +
            " and l.licencePlateCountry = e.licencePlateCountry" +
            " and l.licencePlateProvince = e.licencePlateProvince" +
            " and l.licencePlateNumber = e.licencePlateNumber") +
        (" inner join ParkingTickets t" +
            " on e.ticketID = t.ticketID" +
            " and e.licencePlateCountry = t.licencePlateCountry" +
            " and e.licencePlateProvince = t.licencePlateProvince" +
            " and e.licencePlateNumber = t.licencePlateNumber" +
            " and t.recordDelete_timeMillis is null" +
            " and t.resolvedDate is null") +
        " where l.recordDelete_timeMillis is null" +
        " and l.isAcknowledged = 0" +
        (params.length > 0 ? " and l.batchID = ? and l.logIndex = ?" : ""))
        .all(params);
    db.close();
    logEntries.forEach(addCalculatedFieldsFn);
    return logEntries;
}
exports.getUnacknowledgedLicencePlateLookupErrorLog = getUnacknowledgedLicencePlateLookupErrorLog;
function markLicencePlateLookupErrorLogEntryAcknowledged(batchID, logIndex, reqSession) {
    const db = sqlite(exports.dbPath);
    const info = db.prepare("update LicencePlateLookupErrorLog" +
        " set isAcknowledged = 1," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and batchID = ?" +
        " and logIndex = ?" +
        " and isAcknowledged = 0")
        .run(reqSession.user.userName, Date.now(), batchID, logIndex);
    db.close();
    return info.changes > 0;
}
exports.markLicencePlateLookupErrorLogEntryAcknowledged = markLicencePlateLookupErrorLogEntryAcknowledged;
