"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _globals_1 = require("./_globals");
const dbInit_1 = require("../helpers/dbInit");
const parkingDB = require("../helpers/parkingDB");
const parkingDB_cleanup = require("../helpers/parkingDB-cleanup");
const parkingDB_convict = require("../helpers/parkingDB-convict");
const parkingDB_lookup = require("../helpers/parkingDB-lookup");
const parkingDB_ontario = require("../helpers/parkingDB-ontario");
const parkingDB_related = require("../helpers/parkingDB-related");
const parkingDB_reporting = require("../helpers/parkingDB-reporting");
describe("helpers/parkingDB", () => {
    before(() => {
        dbInit_1.initParkingDB();
    });
    it("should execute getParkingTickets()", () => {
        assert.ok(parkingDB.getParkingTickets(_globals_1.fakeViewOnlySession, { limit: 1, offset: 0 }));
    });
    it("should execute getParkingTicket(-1)", () => {
        assert.equal(parkingDB.getParkingTicket(-1, _globals_1.fakeViewOnlySession), null);
    });
    describe("-cleanup", () => {
        const deleteTimeMillis = Date.now() + (3600 * 1000);
        it("should execute getDatabaseCleanupCounts()", () => {
            assert.ok(parkingDB_cleanup.getDatabaseCleanupCounts());
        });
        it("should execute cleanupParkingTicketsTable()", () => {
            assert.ok(parkingDB_cleanup.cleanupParkingTicketsTable(deleteTimeMillis));
        });
        it("should execute cleanupParkingTicketRemarksTable()", () => {
            assert.ok(parkingDB_cleanup.cleanupParkingTicketRemarksTable(deleteTimeMillis));
        });
        it("should execute cleanupParkingTicketStatusLog()", () => {
            assert.ok(parkingDB_cleanup.cleanupParkingTicketStatusLog(deleteTimeMillis));
        });
        it("should execute cleanupLicencePlateOwnersTable()", () => {
            assert.ok(parkingDB_cleanup.cleanupLicencePlateOwnersTable(deleteTimeMillis));
        });
    });
    describe("-convict", () => {
        it("should execute getLastTenParkingTicketConvictionBatches()", () => {
            assert.ok(parkingDB_convict.getLastTenParkingTicketConvictionBatches());
        });
        it("should execute getParkingTicketConvictionBatch()", () => {
            assert.equal(parkingDB_convict.getParkingTicketConvictionBatch(-1), null);
        });
    });
    describe("-lookup", () => {
        it("should execute getUnreceivedLicencePlateLookupBatches()", () => {
            assert.ok(parkingDB_lookup.getUnreceivedLicencePlateLookupBatches(true));
        });
        it("should execute getOwnershipReconciliationRecords()", () => {
            assert.ok(parkingDB_lookup.getOwnershipReconciliationRecords());
        });
        it("should execute getUnacknowledgedLicencePlateLookupErrorLog()", () => {
            assert.ok(parkingDB_lookup.getUnacknowledgedLicencePlateLookupErrorLog(-1, -1));
        });
    });
    describe("-ontario", () => {
        it("should execute getLicencePlatesAvailableForMTOLookupBatch()", () => {
            assert.ok(parkingDB_ontario.getLicencePlatesAvailableForMTOLookupBatch(-1, -1));
        });
        it("should execute getParkingTicketsAvailableForMTOConvictionBatch()", () => {
            assert.ok(parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch());
        });
    });
    describe("-related", () => {
        it("should execute getParkingLocations()", () => {
            assert.ok(parkingDB_related.getParkingLocations());
        });
        it("should execute getParkingBylaws()", () => {
            assert.ok(parkingDB_related.getParkingBylaws());
        });
        it("should execute getParkingBylawsWithOffenceStats()", () => {
            assert.ok(parkingDB_related.getParkingBylawsWithOffenceStats());
        });
        it("should execute getParkingOffences()", () => {
            assert.ok(parkingDB_related.getParkingOffences());
        });
        it("should execute getParkingOffencesByLocationKey()", () => {
            assert.ok(parkingDB_related.getParkingOffencesByLocationKey(""));
        });
    });
    describe("-reporting", () => {
        describe("#getReportRowsColumns()", () => {
            it("should return null for an invalid report", () => {
                assert.equal(parkingDB_reporting.getReportRowsColumns("invalid-report-name", {}), null);
            });
            it("should return data for a valid report", () => {
                assert.ok(parkingDB_reporting.getReportRowsColumns("bylaws-all", {}));
            });
        });
    });
});
