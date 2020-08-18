"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _1_serverStart_1 = require("./1_serverStart");
const userFns = require("../helpers/userFns");
describe("userFns", () => {
    it("userCanCreate(fakeViewOnlyRequest) is false", () => {
        assert.equal(userFns.userCanCreate(_1_serverStart_1.fakeViewOnlyRequest), false);
    });
    it("userCanUpdate(fakeViewOnlyRequest) is false", () => {
        assert.equal(userFns.userCanUpdate(_1_serverStart_1.fakeViewOnlyRequest), false);
    });
    it("userIsAdmin(fakeViewOnlyRequest) is false", () => {
        assert.equal(userFns.userIsAdmin(_1_serverStart_1.fakeViewOnlyRequest), false);
    });
    it("userIsOperator(fakeViewOnlyRequest) is false", () => {
        assert.equal(userFns.userIsOperator(_1_serverStart_1.fakeViewOnlyRequest), false);
    });
    it("userCanCreate(fakeAdminRequest) is true", () => {
        assert.ok(userFns.userCanCreate(_1_serverStart_1.fakeAdminRequest));
    });
    it("userCanUpdate(fakeAdminRequest) is true", () => {
        assert.ok(userFns.userCanUpdate(_1_serverStart_1.fakeAdminRequest));
    });
    it("userIsAdmin(fakeAdminRequest) is true", () => {
        assert.ok(userFns.userIsAdmin(_1_serverStart_1.fakeAdminRequest));
    });
    it("userIsOperator(fakeAdminRequest) is true", () => {
        assert.ok(userFns.userIsOperator(_1_serverStart_1.fakeAdminRequest));
    });
});
