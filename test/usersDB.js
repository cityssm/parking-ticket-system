"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const dbInit_1 = require("../helpers/dbInit");
const usersDB = require("../helpers/usersDB");
describe("helpers/usersDB", () => {
    before(() => {
        dbInit_1.initUsersDB();
    });
    it("should execute getUser()", () => {
        assert.equal(usersDB.getUser("", ""), null);
    });
    it("should execute getAllUsers()", () => {
        assert.ok(usersDB.getAllUsers());
    });
    it("should execute getUserProperties()", () => {
        assert.ok(usersDB.getUserProperties(""));
    });
    it("should execute inactivateUser() with blank user name", () => {
        assert.equal(usersDB.inactivateUser(""), 0);
    });
});
