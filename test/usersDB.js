"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const initializeDatabase_1 = require("../helpers/usersDB/initializeDatabase");
const usersDB_getUser = require("../helpers/usersDB/getUser");
const usersDB_getAllUsers = require("../helpers/usersDB/getAllUsers");
const usersDB_getUserProperties = require("../helpers/usersDB/getUserProperties");
const usersDB_inactivateUser = require("../helpers/usersDB/inactivateUser");
describe("helpers/usersDB", () => {
    before(() => {
        initializeDatabase_1.initializeDatabase();
    });
    it("should execute getUser()", () => {
        assert.equal(usersDB_getUser.getUser("", ""), null);
    });
    it("should execute getAllUsers()", () => {
        assert.ok(usersDB_getAllUsers.getAllUsers());
    });
    it("should execute getUserProperties()", () => {
        assert.ok(usersDB_getUserProperties.getUserProperties(""));
    });
    it("should execute inactivateUser() with blank user name", () => {
        assert.equal(usersDB_inactivateUser.inactivateUser(""), 0);
    });
});
