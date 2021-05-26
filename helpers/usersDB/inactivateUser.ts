import sqlite from "better-sqlite3";

import { usersDB as dbPath } from "../../data/databasePaths.js";


export const inactivateUser = (userName: string) => {

  const db = sqlite(dbPath);

  const info = db.prepare("update Users" +
    " set isActive = 0" +
    " where userName = ?" +
    " and isActive = 1")
    .run(userName);

  db.close();

  return info.changes;
};


export default inactivateUser;
