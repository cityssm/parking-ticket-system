import sqlite from "better-sqlite3";
import bcrypt from "bcrypt";
import * as stringFns from "@cityssm/expressjs-server-js/stringFns.js";
import * as userFunctions from "../functions.user.js";
import { usersDB as databasePath } from "../../data/databasePaths.js";
export const createUser = async (requestBody) => {
    const newPasswordPlain = stringFns.generatePassword();
    const hash = await bcrypt.hash(userFunctions.getHashString(requestBody.userName, newPasswordPlain), 10);
    const database = sqlite(databasePath);
    const row = database.prepare("select isActive" +
        " from Users" +
        " where userName = ?")
        .get(requestBody.userName);
    if (row) {
        if (row.isActive) {
            database.close();
            return false;
        }
        database.prepare("update Users" +
            " set firstName = ?," +
            " lastName = ?," +
            " passwordHash = ?," +
            " isActive = 1" +
            " where userName = ?")
            .run(requestBody.firstName, requestBody.lastName, hash, requestBody.userName);
        database.prepare("delete from UserProperties" +
            " where userName = ?")
            .run(requestBody.userName);
    }
    else {
        database.prepare("insert into Users" +
            " (userName, firstName, lastName, isActive, passwordHash)" +
            " values (?, ?, ?, 1, ?)")
            .run(requestBody.userName, requestBody.firstName, requestBody.lastName, hash);
    }
    return newPasswordPlain;
};
export default createUser;
