"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _1_serverStart_1 = require("./1_serverStart");
const dbInit_1 = require("../helpers/dbInit");
const parkingDB = require("../helpers/parkingDB");
const parkingDB_cleanup = require("../helpers/parkingDB-cleanup");
const parkingDB_convict = require("../helpers/parkingDB-convict");
const parkingDB_lookup = require("../helpers/parkingDB-lookup");
const parkingDB_ontario = require("../helpers/parkingDB-ontario");
const parkingDB_related = require("../helpers/parkingDB-related");
const parkingDB_reporting = require("../helpers/parkingDB-reporting");
describe("parkingDB", () => {
    before(() => {
        dbInit_1.initParkingDB();
    });
    it("Execute getParkingTickets()", () => {
        assert.ok(parkingDB.getParkingTickets(_1_serverStart_1.fakeViewOnlySession, { limit: 1, offset: 0 }));
    });
    it("Execute getParkingTicket(-1)", () => {
        assert.equal(parkingDB.getParkingTicket(-1, _1_serverStart_1.fakeViewOnlySession), null);
    });
    describe("cleanup", () => {
        const deleteTimeMillis = Date.now() + (3600 * 1000);
        it("Execute getDatabaseCleanupCounts()", () => {
            assert.ok(parkingDB_cleanup.getDatabaseCleanupCounts());
        });
        it("Execute cleanupParkingTicketsTable()", () => {
            assert.ok(parkingDB_cleanup.cleanupParkingTicketsTable(deleteTimeMillis));
        });
        it("Execute cleanupParkingTicketRemarksTable()", () => {
            assert.ok(parkingDB_cleanup.cleanupParkingTicketRemarksTable(deleteTimeMillis));
        });
        it("Execute cleanupParkingTicketStatusLog()", () => {
            assert.ok(parkingDB_cleanup.cleanupParkingTicketStatusLog(deleteTimeMillis));
        });
        it("Execute cleanupLicencePlateOwnersTable()", () => {
            assert.ok(parkingDB_cleanup.cleanupLicencePlateOwnersTable(deleteTimeMillis));
        });
    });
    describe("convict", () => {
        it("Execute getLastTenParkingTicketConvictionBatches()", () => {
            assert.ok(parkingDB_convict.getLastTenParkingTicketConvictionBatches());
        });
        it("Execute getParkingTicketConvictionBatch()", () => {
            assert.equal(parkingDB_convict.getParkingTicketConvictionBatch(-1), null);
        });
    });
    describe("lookup", () => {
        it("Execute getUnreceivedLicencePlateLookupBatches()", () => {
            assert.ok(parkingDB_lookup.getUnreceivedLicencePlateLookupBatches(true));
        });
        it("Execute getOwnershipReconciliationRecords()", () => {
            assert.ok(parkingDB_lookup.getOwnershipReconciliationRecords());
        });
        it("Execute getUnacknowledgedLicencePlateLookupErrorLog()", () => {
            assert.ok(parkingDB_lookup.getUnacknowledgedLicencePlateLookupErrorLog(-1, -1));
        });
    });
    describe("ontario", () => {
        it("Execute getLicencePlatesAvailableForMTOLookupBatch()", () => {
            assert.ok(parkingDB_ontario.getLicencePlatesAvailableForMTOLookupBatch(-1, -1));
        });
        it("Execute getParkingTicketsAvailableForMTOConvictionBatch()", () => {
            assert.ok(parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch());
        });
    });
    describe("related", () => {
        it("Execute getParkingLocations()", () => {
            assert.ok(parkingDB_related.getParkingLocations());
        });
        it("Execute getParkingBylaws()", () => {
            assert.ok(parkingDB_related.getParkingBylaws());
        });
        it("Execute getParkingBylawsWithOffenceStats()", () => {
            assert.ok(parkingDB_related.getParkingBylawsWithOffenceStats());
        });
        it("Execute getParkingOffences()", () => {
            assert.ok(parkingDB_related.getParkingOffences());
        });
        it("Execute getParkingOffencesByLocationKey()", () => {
            assert.ok(parkingDB_related.getParkingOffencesByLocationKey(""));
        });
    });
    describe("reporting", () => {
        describe("#getReportRowsColumns()", () => {
            it("Invalid report name", () => {
                assert.equal(parkingDB_reporting.getReportRowsColumns("invalid-report-name", {}), null);
            });
            it("Bylaws report", () => {
                assert.ok(parkingDB_reporting.getReportRowsColumns("bylaws-all", {}));
            });
        });
    });
});
