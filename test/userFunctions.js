import * as assert from 'node:assert';
import * as userFunctions from '../helpers/functions.user.js';
import { fakeViewOnlyRequest, fakeAdminRequest } from './_globals.js';
const fakeRequest = {};
describe('helpers/userFunctions', () => {
    describe('request.session.user = null', () => {
        it('userCanUpdate()  => false', () => {
            assert.equal(userFunctions.userCanUpdate(fakeRequest), false);
        });
        it('userIsAdmin()    => false', () => {
            assert.equal(userFunctions.userIsAdmin(fakeRequest), false);
        });
        it('userIsOperator() => false', () => {
            assert.equal(userFunctions.userIsOperator(fakeRequest), false);
        });
    });
    describe('request.session.user = viewOnly', () => {
        it('userCanUpdate()  => false', () => {
            assert.equal(userFunctions.userCanUpdate(fakeViewOnlyRequest), false);
        });
        it('userIsAdmin()    => false', () => {
            assert.equal(userFunctions.userIsAdmin(fakeViewOnlyRequest), false);
        });
        it('userIsOperator() => false', () => {
            assert.equal(userFunctions.userIsOperator(fakeViewOnlyRequest), false);
        });
    });
    describe('request.session.user = admin', () => {
        it('userCanUpdate()  => true', () => {
            assert.ok(userFunctions.userCanUpdate(fakeAdminRequest));
        });
        it('userIsAdmin()    => true', () => {
            assert.ok(userFunctions.userIsAdmin(fakeAdminRequest));
        });
        it('userIsOperator() => true', () => {
            assert.ok(userFunctions.userIsOperator(fakeAdminRequest));
        });
    });
});
