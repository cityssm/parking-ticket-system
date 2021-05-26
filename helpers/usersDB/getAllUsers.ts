import sqlite from "better-sqlite3";

import { usersDB as dbPath } from "../../data/databasePaths.js";

import type { User } from "../../types/recordTypes";


export const getAllUsers = () => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: User[] =
    db.prepare("select userName, firstName, lastName" +
      " from Users" +
      " where isActive = 1" +
      " order by userName")
      .all();

  db.close();

  return rows;
};


export default getAllUsers;
