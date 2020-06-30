"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParkingOffence = exports.updateParkingOffence = exports.addParkingOffence = exports.getParkingOffencesByLocationKey = exports.getParkingOffences = exports.updateParkingOffencesByBylawNumber = exports.deleteParkingBylaw = exports.updateParkingBylaw = exports.addParkingBylaw = exports.getParkingBylawsWithOffenceStats = exports.getParkingBylaws = exports.deleteParkingLocation = exports.updateParkingLocation = exports.addParkingLocation = exports.getParkingLocations = void 0;
const parkingDB_1 = require("./parkingDB");
const sqlite = require("better-sqlite3");
exports.getParkingLocations = () => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const rows = db.prepare("select locationKey, locationName, locationClassKey" +
        " from ParkingLocations" +
        " where isActive = 1" +
        " order by orderNumber, locationName")
        .all();
    db.close();
    return rows;
};
exports.addParkingLocation = (reqBody) => {
    const db = sqlite(parkingDB_1.dbPath);
    const locationRecord = db.prepare("select locationName, isActive" +
        " from ParkingLocations" +
        " where locationKey = ?")
        .get(reqBody.locationKey);
    if (locationRecord) {
        db.close();
        return {
            success: false,
            message: "The location key \"" + reqBody.locationKey + "\"" +
                " is already associated with the " +
                (locationRecord.isActive ? "" : "inactive ") +
                " record \"" + locationRecord.locationName + "\"."
        };
    }
    const info = db.prepare("insert into ParkingLocations (" +
        "locationKey, locationName, locationClassKey, orderNumber, isActive)" +
        " values (?, ?, ?, 0, 1)")
        .run(reqBody.locationKey, reqBody.locationName, reqBody.locationClassKey);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
exports.updateParkingLocation = (reqBody) => {
    const db = sqlite(parkingDB_1.dbPath);
    const info = db.prepare("update ParkingLocations" +
        " set locationName = ?," +
        " locationClassKey = ?" +
        " where locationKey = ?" +
        " and isActive = 1")
        .run(reqBody.locationName, reqBody.locationClassKey, reqBody.locationKey);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
exports.deleteParkingLocation = (locationKey) => {
    const db = sqlite(parkingDB_1.dbPath);
    const info = db.prepare("update ParkingLocations" +
        " set isActive = 0" +
        " where locationKey = ?" +
        " and isActive = 1")
        .run(locationKey);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
exports.getParkingBylaws = () => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const rows = db.prepare("select bylawNumber, bylawDescription" +
        " from ParkingBylaws" +
        " where isActive = 1" +
        " order by orderNumber, bylawNumber")
        .all();
    db.close();
    return rows;
};
exports.getParkingBylawsWithOffenceStats = () => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const rows = db.prepare("select b.bylawNumber, b.bylawDescription," +
        " count(o.locationKey) as offenceCount," +
        " min(o.offenceAmount) as offenceAmountMin," +
        " max(o.offenceAmount) as offenceAmountMax," +
        " min(o.discountOffenceAmount) as discountOffenceAmountMin," +
        " max(o.discountOffenceAmount) as discountOffenceAmountMax," +
        " min(o.discountDays) as discountDaysMin," +
        " max(o.discountDays) as discountDaysMax" +
        " from ParkingBylaws b" +
        " left join ParkingOffences o on b.bylawNumber = o.bylawNumber and o.isActive = 1" +
        " where b.isActive = 1" +
        " group by b.bylawNumber, b.bylawDescription, b.orderNumber" +
        " order by b.orderNumber, b.bylawNumber")
        .all();
    db.close();
    return rows;
};
exports.addParkingBylaw = (reqBody) => {
    const db = sqlite(parkingDB_1.dbPath);
    const bylawRecord = db.prepare("select bylawDescription, isActive" +
        " from ParkingBylaws" +
        " where bylawNumber = ?")
        .get(reqBody.bylawNumber);
    if (bylawRecord) {
        if (bylawRecord.isActive) {
            db.close();
            return {
                success: false,
                message: "By-law number \"" + reqBody.bylawNumber + "\"" +
                    " is already associated with the " +
                    " record \"" + bylawRecord.bylawDescription + "\"."
            };
        }
        const info = db.prepare("update ParkingBylaws" +
            " set isActive = 1" +
            " where bylawNumber = ?")
            .run(reqBody.bylawNumber);
        db.close();
        return {
            success: (info.changes > 0),
            message: "By-law number \"" + reqBody.bylawNumber + "\" is associated with a previously removed record." +
                " That record has been restored with the original description."
        };
    }
    const info = db.prepare("insert into ParkingBylaws (" +
        "bylawNumber, bylawDescription, orderNumber, isActive)" +
        " values (?, ?, 0, 1)")
        .run(reqBody.bylawNumber, reqBody.bylawDescription);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
exports.updateParkingBylaw = (reqBody) => {
    const db = sqlite(parkingDB_1.dbPath);
    const info = db.prepare("update ParkingBylaws" +
        " set bylawDescription = ?" +
        " where bylawNumber = ?" +
        " and isActive = 1")
        .run(reqBody.bylawDescription, reqBody.bylawNumber);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
exports.deleteParkingBylaw = (bylawNumber) => {
    const db = sqlite(parkingDB_1.dbPath);
    const info = db.prepare("update ParkingBylaws" +
        " set isActive = 0" +
        " where bylawNumber = ?" +
        " and isActive = 1")
        .run(bylawNumber);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
exports.updateParkingOffencesByBylawNumber = (reqBody) => {
    const db = sqlite(parkingDB_1.dbPath);
    const info = db.prepare("update ParkingOffences" +
        " set offenceAmount = ?," +
        " discountOffenceAmount = ?," +
        " discountDays = ?" +
        " where bylawNumber = ?" +
        " and isActive = 1")
        .run(reqBody.offenceAmount, reqBody.discountOffenceAmount, reqBody.discountDays, reqBody.bylawNumber);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
exports.getParkingOffences = () => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const rows = db.prepare("select o.bylawNumber, o.locationKey, o.parkingOffence," +
        " o.offenceAmount, o.discountOffenceAmount, o.discountDays, o.accountNumber" +
        " from ParkingOffences o" +
        " left join ParkingLocations l on o.locationKey = l.locationKey" +
        " where o.isActive = 1 and l.isActive" +
        " and o.bylawNumber in (select b.bylawNumber from ParkingBylaws b where b.isActive = 1)" +
        " order by o.bylawNumber, l.locationName")
        .all();
    db.close();
    return rows;
};
exports.getParkingOffencesByLocationKey = (locationKey) => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const rows = db.prepare("select o.bylawNumber, b.bylawDescription," +
        " o.parkingOffence, o.offenceAmount, o.discountOffenceAmount, o.discountDays" +
        " from ParkingOffences o" +
        " left join ParkingBylaws b on o.bylawNumber = b.bylawNumber" +
        " where o.isActive = 1 and b.isActive = 1" +
        " and o.locationKey = ?" +
        " order by b.orderNumber, b.bylawNumber")
        .all(locationKey);
    db.close();
    return rows;
};
exports.addParkingOffence = (reqBody) => {
    const db = sqlite(parkingDB_1.dbPath);
    const existingOffenceRecord = db.prepare("select isActive" +
        " from ParkingOffences" +
        " where bylawNumber = ?" +
        " and locationKey = ?")
        .get(reqBody.bylawNumber, reqBody.locationKey);
    if (existingOffenceRecord) {
        if (existingOffenceRecord.isActive) {
            db.close();
            return {
                success: false,
                message: "An active offence already exists for the same location and by-law."
            };
        }
        else {
            const info = db.prepare("update ParkingOffences" +
                " set isActive = 1" +
                " where bylawNumber = ?" +
                " and locationKey = ?")
                .run(reqBody.bylawNumber, reqBody.locationKey);
            db.close();
            return {
                success: (info.changes > 0),
                message: "A previously deleted offence for the same location and by-law has been restored."
            };
        }
    }
    let offenceAmount = 0;
    let discountOffenceAmount = 0;
    let discountDays = 0;
    if (reqBody.hasOwnProperty("offenceAmount")) {
        offenceAmount = reqBody.offenceAmount;
        discountOffenceAmount = reqBody.hasOwnProperty("discountOffenceAmount")
            ? reqBody.discountOffenceAmount
            : reqBody.offenceAmount;
        discountDays = reqBody.discountDays || 0;
    }
    else {
        const offenceAmountRecord = db.prepare("select offenceAmount, discountOffenceAmount, discountDays" +
            " from ParkingOffences" +
            " where bylawNumber = ?" +
            " and isActive = 1" +
            " group by offenceAmount, discountOffenceAmount, discountDays" +
            " order by count(locationKey) desc, offenceAmount desc, discountOffenceAmount desc" +
            " limit 1")
            .get(reqBody.bylawNumber);
        if (offenceAmountRecord) {
            offenceAmount = offenceAmountRecord.offenceAmount;
            discountOffenceAmount = offenceAmountRecord.discountOffenceAmount;
            discountDays = offenceAmountRecord.discountDays;
        }
    }
    const info = db.prepare("insert into ParkingOffences" +
        " (bylawNumber, locationKey, parkingOffence," +
        " offenceAmount, discountOffenceAmount, discountDays," +
        " accountNumber, isActive)" +
        " values (?, ?, ?, ?, ?, ?, ?, 1)")
        .run(reqBody.bylawNumber, reqBody.locationKey, reqBody.parkingOffence || "", offenceAmount, discountOffenceAmount, discountDays, reqBody.accountNumber || "");
    db.close();
    return {
        success: (info.changes > 0)
    };
};
exports.updateParkingOffence = (reqBody) => {
    const db = sqlite(parkingDB_1.dbPath);
    const info = db.prepare("update ParkingOffences" +
        " set parkingOffence = ?," +
        " offenceAmount = ?," +
        " discountOffenceAmount = ?," +
        " discountDays = ?," +
        " accountNumber = ?" +
        " where bylawNumber = ?" +
        " and locationKey = ?" +
        " and isActive = 1")
        .run(reqBody.parkingOffence, reqBody.offenceAmount, reqBody.discountOffenceAmount, reqBody.discountDays, reqBody.accountNumber, reqBody.bylawNumber, reqBody.locationKey);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
exports.deleteParkingOffence = (bylawNumber, locationKey) => {
    const db = sqlite(parkingDB_1.dbPath);
    const info = db.prepare("update ParkingOffences" +
        " set isActive = 0" +
        " where bylawNumber = ?" +
        " and locationKey = ?" +
        " and isActive = 1")
        .run(bylawNumber, locationKey);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
