"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const dbInit_1 = require("../helpers/dbInit");
const usersDB = require("../helpers/usersDB");
describe("usersDB", () => {
    before(() => {
        dbInit_1.initUsersDB();
    });
    it("Execute getUser()", () => {
        assert.equal(usersDB.getUser("", ""), null);
    });
    it("Execute getAllUsers()", () => {
        assert.ok(usersDB.getAllUsers());
    });
    it("Execute getUserProperties()", () => {
        assert.ok(usersDB.getUserProperties(""));
    });
    it("Execute inactivateUser() with blank user name", () => {
        assert.equal(usersDB.inactivateUser(""), 0);
    });
});
