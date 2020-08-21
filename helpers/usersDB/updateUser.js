"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.updateUser = (reqBody) => {
    const db = sqlite(databasePaths_1.usersDB);
    const info = db.prepare("update Users" +
        " set firstName = ?," +
        " lastName = ?" +
        " where userName = ?" +
        " and isActive = 1")
        .run(reqBody.firstName, reqBody.lastName, reqBody.userName);
    db.close();
    return info.changes;
};
