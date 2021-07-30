import sqlite from "better-sqlite3";

import bcrypt from "bcrypt";

import * as stringFns from "@cityssm/expressjs-server-js/stringFns.js";
import * as userFunctions from "../functions.user.js";

import { usersDB as databasePath } from "../../data/databasePaths.js";


export const generateNewPassword = async(userName: string): Promise<string> => {

  const newPasswordPlain: string = stringFns.generatePassword();
  const hash = await bcrypt.hash(userFunctions.getHashString(userName, newPasswordPlain), 10);

  const database = sqlite(databasePath);

  database.prepare("update Users" +
    " set passwordHash = ?" +
    " where userName = ?")
    .run(hash, userName);

  database.close();

  return newPasswordPlain;
};


export default generateNewPassword;
