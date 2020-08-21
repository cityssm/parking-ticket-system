"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _globals_1 = require("./_globals");
const dbInit_1 = require("../helpers/dbInit");
const parkingDB_getParkingTickets = require("../helpers/parkingDB/getParkingTickets");
const parkingDB_getParkingTicket = require("../helpers/parkingDB/getParkingTicket");
const parkingDB_getConvictionBatch = require("../helpers/parkingDB/getConvictionBatch");
const parkingDB_getLastTenConvictionBatches = require("../helpers/parkingDB/getLastTenConvictionBatches");
const parkingDB_getOwnershipReconciliationRecords = require("../helpers/parkingDB/getOwnershipReconciliationRecords");
const parkingDB_getUnreceivedLookupBatches = require("../helpers/parkingDB/getUnreceivedLookupBatches");
const parkingDB_getUnacknowledgedLookupErrorLog = require("../helpers/parkingDB/getUnacknowledgedLookupErrorLog");
const parkingDB_getParkingOffences = require("../helpers/parkingDB/getParkingOffences");
const parkingDB_getParkingBylaws = require("../helpers/parkingDB/getParkingBylaws");
const parkingDB_getParkingLocations = require("../helpers/parkingDB/getParkingLocations");
const parkingDB_cleanup = require("../helpers/parkingDB-cleanup");
const parkingDB_ontario = require("../helpers/parkingDB-ontario");
const parkingDB_reporting = require("../helpers/parkingDB-reporting");
describe("helpers/parkingDB", () => {
    before(() => {
        dbInit_1.initParkingDB();
    });
    it("should execute getParkingTickets()", () => {
        assert.ok(parkingDB_getParkingTickets.getParkingTickets(_globals_1.fakeViewOnlySession, { limit: 1, offset: 0 }));
    });
    it("should execute getParkingTicket(-1)", () => {
        assert.equal(parkingDB_getParkingTicket.getParkingTicket(-1, _globals_1.fakeViewOnlySession), null);
    });
    it("should execute getLastTenConvictionBatches()", () => {
        assert.ok(parkingDB_getLastTenConvictionBatches.getLastTenConvictionBatches());
    });
    it("should execute getConvictionBatch()", () => {
        assert.equal(parkingDB_getConvictionBatch.getConvictionBatch(-1), null);
    });
    it("should execute getUnreceivedLookupBatches()", () => {
        assert.ok(parkingDB_getUnreceivedLookupBatches.getUnreceivedLookupBatches(true));
    });
    it("should execute getOwnershipReconciliationRecords()", () => {
        assert.ok(parkingDB_getOwnershipReconciliationRecords.getOwnershipReconciliationRecords());
    });
    it("should execute getUnacknowledgedLookupErrorLog()", () => {
        assert.ok(parkingDB_getUnacknowledgedLookupErrorLog.getUnacknowledgedLookupErrorLog(-1, -1));
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
            assert.ok(parkingDB_getParkingLocations.getParkingLocations());
        });
        it("should execute getParkingBylaws()", () => {
            assert.ok(parkingDB_getParkingBylaws.getParkingBylaws());
        });
        it("should execute getParkingBylawsWithOffenceStats()", () => {
            assert.ok(parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats());
        });
        it("should execute getParkingOffences()", () => {
            assert.ok(parkingDB_getParkingOffences.getParkingOffences());
        });
        it("should execute getParkingOffencesByLocationKey()", () => {
            assert.ok(parkingDB_getParkingOffences.getParkingOffencesByLocationKey(""));
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
