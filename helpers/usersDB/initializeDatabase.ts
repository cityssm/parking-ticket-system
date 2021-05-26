import sqlite from "better-sqlite3";

import { usersDB as dbPath } from "../../data/databasePaths.js";

import debug from "debug";
const debugSQL = debug("parking-ticket-system:usersDB:initializeDatabase");


export const initializeDatabase = () => {

  const usersDB = sqlite(dbPath);

  let doCreate = false;

  const row = usersDB.prepare("select name from sqlite_master where type = 'table' and name = 'Users'").get();

  if (!row) {

    debugSQL("Creating users.db." +
      " To get started creating users, set the 'admin.defaultPassword' property in your config.js file.");

    doCreate = true;

    usersDB.prepare("create table if not exists Users (" +
      "userName varchar(30) primary key not null," +
      " firstName varchar(50), lastName varchar(50)," +
      " isActive bit not null default 1," +
      " passwordHash char(60) not null)" +
      " without rowid").run();

    usersDB.prepare("create table if not exists UserProperties (" +
      "userName varchar(30) not null," +
      " propertyName varchar(100) not null," +
      " propertyValue text," +
      " primary key (userName, propertyName)" +
      " foreign key (userName) references Users (userName))" +
      " without rowid").run();
  }

  usersDB.close();

  return doCreate;
};


export default initializeDatabase;
