"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _1_serverStart_1 = require("./1_serverStart");
const userFns = require("../helpers/userFns");
describe("userFns", () => {
    describe("request.session.user = null", () => {
        it("userCanCreate()  => false", () => {
            assert.equal(userFns.userCanCreate(_1_serverStart_1.fakeRequest), false);
        });
        it("userCanUpdate()  => false", () => {
            assert.equal(userFns.userCanUpdate(_1_serverStart_1.fakeRequest), false);
        });
        it("userIsAdmin()    => false", () => {
            assert.equal(userFns.userIsAdmin(_1_serverStart_1.fakeRequest), false);
        });
        it("userIsOperator() => false", () => {
            assert.equal(userFns.userIsOperator(_1_serverStart_1.fakeRequest), false);
        });
    });
    describe("request.session.user = viewOnly", () => {
        it("userCanCreate()  => false", () => {
            assert.equal(userFns.userCanCreate(_1_serverStart_1.fakeViewOnlyRequest), false);
        });
        it("userCanUpdate()  => false", () => {
            assert.equal(userFns.userCanUpdate(_1_serverStart_1.fakeViewOnlyRequest), false);
        });
        it("userIsAdmin()    => false", () => {
            assert.equal(userFns.userIsAdmin(_1_serverStart_1.fakeViewOnlyRequest), false);
        });
        it("userIsOperator() => false", () => {
            assert.equal(userFns.userIsOperator(_1_serverStart_1.fakeViewOnlyRequest), false);
        });
    });
    describe("request.session.user = admin", () => {
        it("userCanCreate()  => true", () => {
            assert.ok(userFns.userCanCreate(_1_serverStart_1.fakeAdminRequest));
        });
        it("userCanUpdate()  => true", () => {
            assert.ok(userFns.userCanUpdate(_1_serverStart_1.fakeAdminRequest));
        });
        it("userIsAdmin()    => true", () => {
            assert.ok(userFns.userIsAdmin(_1_serverStart_1.fakeAdminRequest));
        });
        it("userIsOperator() => true", () => {
            assert.ok(userFns.userIsOperator(_1_serverStart_1.fakeAdminRequest));
        });
    });
});
