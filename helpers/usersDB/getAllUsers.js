"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.getAllUsers = () => {
    const db = sqlite(databasePaths_1.usersDB, {
        readonly: true
    });
    const rows = db.prepare("select userName, firstName, lastName" +
        " from Users" +
        " where isActive = 1" +
        " order by userName")
        .all();
    db.close();
    return rows;
};
