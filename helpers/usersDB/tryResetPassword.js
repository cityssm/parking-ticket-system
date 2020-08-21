"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryResetPassword = void 0;
const sqlite = require("better-sqlite3");
const bcrypt = require("bcrypt");
const userFns = require("../userFns");
const databasePaths_1 = require("../../data/databasePaths");
exports.tryResetPassword = (userName, oldPasswordPlain, newPasswordPlain) => {
    const db = sqlite(databasePaths_1.usersDB);
    const row = db.prepare("select passwordHash from Users" +
        " where userName = ?" +
        " and isActive = 1")
        .get(userName);
    if (!row) {
        db.close();
        return {
            success: false,
            message: "User record not found."
        };
    }
    const oldPasswordMatches = bcrypt.compareSync(userFns.getHashString(userName, oldPasswordPlain), row.passwordHash);
    if (!oldPasswordMatches) {
        db.close();
        return {
            success: false,
            message: "Old password does not match."
        };
    }
    const newPasswordHash = bcrypt.hashSync(userFns.getHashString(userName, newPasswordPlain), 10);
    db.prepare("update Users" +
        " set passwordHash = ?" +
        " where userName = ?")
        .run(newPasswordHash, userName);
    db.close();
    return {
        success: true,
        message: "Password updated successfully."
    };
};
