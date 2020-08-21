"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
const log = require("fancy-log");
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.initializeDatabase = () => {
    const usersDB = sqlite(databasePaths_1.usersDB);
    let doCreate = false;
    const row = usersDB.prepare("select name from sqlite_master where type = 'table' and name = 'Users'").get();
    if (!row) {
        log.warn("Creating users.db." +
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
