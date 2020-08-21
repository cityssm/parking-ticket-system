"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProperty = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.updateUserProperty = (reqBody) => {
    const db = sqlite(databasePaths_1.usersDB);
    let info;
    if (reqBody.propertyValue === "") {
        info = db.prepare("delete from UserProperties" +
            " where userName = ?" +
            " and propertyName = ?")
            .run(reqBody.userName, reqBody.propertyName);
    }
    else {
        info = db.prepare("replace into UserProperties" +
            " (userName, propertyName, propertyValue)" +
            " values (?, ?, ?)")
            .run(reqBody.userName, reqBody.propertyName, reqBody.propertyValue);
    }
    db.close();
    return info.changes;
};
