"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _1_serverStart_1 = require("./1_serverStart");
const parkingDB = require("../helpers/parkingDB");
describe("parkingDB", () => {
    it("getParkingTickets()", () => {
        assert.ok(parkingDB.getParkingTickets(_1_serverStart_1.fakeSession, { limit: 1, offset: 0 }));
    });
    it("getParkingTicket()", () => {
        assert.equal(parkingDB.getParkingTicket(-1, _1_serverStart_1.fakeSession), null);
    });
});
