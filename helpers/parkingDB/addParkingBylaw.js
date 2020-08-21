"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addParkingBylaw = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.addParkingBylaw = (reqBody) => {
    const db = sqlite(databasePaths_1.parkingDB);
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
