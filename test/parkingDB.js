"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _1_serverStart_1 = require("./1_serverStart");
const parkingDB = require("../helpers/parkingDB");
const parkingDB_cleanup = require("../helpers/parkingDB-cleanup");
describe("parkingDB", () => {
    it("getParkingTickets()", () => {
        assert.ok(parkingDB.getParkingTickets(_1_serverStart_1.fakeViewOnlySession, { limit: 1, offset: 0 }));
    });
    it("getParkingTicket(-1)", () => {
        assert.equal(parkingDB.getParkingTicket(-1, _1_serverStart_1.fakeViewOnlySession), null);
    });
});
describe("parkingDB-cleanup", () => {
    const deleteTimeMillis = Date.now() + (3600 * 1000);
    it("getDatabaseCleanupCounts()", () => {
        assert.ok(parkingDB_cleanup.getDatabaseCleanupCounts());
    });
    it("cleanupParkingTicketsTable()", () => {
        assert.ok(parkingDB_cleanup.cleanupParkingTicketsTable(deleteTimeMillis));
    });
    it("cleanupParkingTicketRemarksTable()", () => {
        assert.ok(parkingDB_cleanup.cleanupParkingTicketRemarksTable(deleteTimeMillis));
    });
    it("cleanupParkingTicketStatusLog()", () => {
        assert.ok(parkingDB_cleanup.cleanupParkingTicketStatusLog(deleteTimeMillis));
    });
    it("cleanupLicencePlateOwnersTable()", () => {
        assert.ok(parkingDB_cleanup.cleanupLicencePlateOwnersTable(deleteTimeMillis));
    });
});
