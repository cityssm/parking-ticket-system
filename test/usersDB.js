"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const stringFns = require("@cityssm/expressjs-server-js/stringFns");
const _globals_1 = require("./_globals");
const initializeDatabase_1 = require("../helpers/usersDB/initializeDatabase");
const usersDB_getUser = require("../helpers/usersDB/getUser");
const usersDB_createUser = require("../helpers/usersDB/createUser");
const usersDB_generateNewPassword = require("../helpers/usersDB/generateNewPassword");
const usersDB_tryResetPassword = require("../helpers/usersDB/tryResetPassword");
const usersDB_getAllUsers = require("../helpers/usersDB/getAllUsers");
const usersDB_updateUser = require("../helpers/usersDB/updateUser");
const usersDB_updateUserProperty = require("../helpers/usersDB/updateUserProperty");
const usersDB_getUserProperties = require("../helpers/usersDB/getUserProperties");
const usersDB_inactivateUser = require("../helpers/usersDB/inactivateUser");
describe("helpers/usersDB", () => {
    let password;
    before(() => {
        initializeDatabase_1.initializeDatabase();
        usersDB_inactivateUser.inactivateUser(_globals_1.userName);
        password = usersDB_createUser.createUser({
            userName: _globals_1.userName,
            firstName: "Test",
            lastName: "User"
        });
        usersDB_updateUserProperty.updateUserProperty({
            userName: _globals_1.userName,
            propertyName: "isOperator",
            propertyValue: "false"
        });
        usersDB_updateUserProperty.updateUserProperty({
            userName: _globals_1.userName,
            propertyName: "isAdmin",
            propertyValue: "false"
        });
        usersDB_updateUserProperty.updateUserProperty({
            userName: _globals_1.userName,
            propertyName: "canUpdate",
            propertyValue: "true"
        });
        usersDB_updateUserProperty.updateUserProperty({
            userName: _globals_1.userName,
            propertyName: "canCreate",
            propertyValue: "true"
        });
    });
    after(() => {
        usersDB_inactivateUser.inactivateUser(_globals_1.userName);
    });
    it("should execute getUser() successfully", () => {
        assert.equal(usersDB_getUser.getUser(_globals_1.userName, password).userName, _globals_1.userName);
    });
    it("should execute getUser() unsuccessfully", () => {
        assert.equal(usersDB_getUser.getUser(_globals_1.userName, password + "_"), null);
    });
    it("should execute getAllUsers()", () => {
        assert.ok(usersDB_getAllUsers.getAllUsers().length > 0);
    });
    it("should execute updateUser()", () => {
        assert.ok(usersDB_updateUser.updateUser({
            userName: _globals_1.userName,
            firstName: "Test",
            lastName: "Rename"
        }) > 0);
    });
    it("getUserProperties().canCreate => true", () => {
        assert.equal(usersDB_getUserProperties.getUserProperties(_globals_1.userName).canCreate, true);
    });
    it("getUserProperties().isAdmin   => false", () => {
        assert.equal(usersDB_getUserProperties.getUserProperties(_globals_1.userName).isAdmin, false);
    });
    it("should execute tryResetPassword() successfully", () => {
        const oldPassword = password;
        password = stringFns.generatePassword();
        const results = usersDB_tryResetPassword.tryResetPassword(_globals_1.userName, oldPassword, password);
        assert.equal(results.success, true);
    });
    it("should execute tryResetPassword() unsuccessfully", () => {
        const newPassword = stringFns.generatePassword();
        const results = usersDB_tryResetPassword.tryResetPassword(_globals_1.userName, password + "_", newPassword);
        assert.equal(results.success, false);
    });
    it("should execute generateNewPassword()", () => {
        const oldPassword = password;
        password = usersDB_generateNewPassword.generateNewPassword(_globals_1.userName);
        assert.notEqual(password, oldPassword);
    });
    it("should execute inactivateUser()", () => {
        assert.equal(usersDB_inactivateUser.inactivateUser(_globals_1.userName), 1);
    });
});
