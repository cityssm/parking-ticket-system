"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _globals_1 = require("./_globals");
const initializeDatabase_1 = require("../helpers/parkingDB/initializeDatabase");
const parkingDB_getParkingTickets = require("../helpers/parkingDB/getParkingTickets");
const parkingDB_getParkingTicket = require("../helpers/parkingDB/getParkingTicket");
const parkingDB_getParkingTicketID = require("../helpers/parkingDB/getParkingTicketID");
const parkingDB_getParkingTicketRemarks = require("../helpers/parkingDB/getParkingTicketRemarks");
const parkingDB_getParkingTicketStatuses = require("../helpers/parkingDB/getParkingTicketStatuses");
const parkingDB_getLicencePlateOwner = require("../helpers/parkingDB/getLicencePlateOwner");
const parkingDB_getLicencePlates = require("../helpers/parkingDB/getLicencePlates");
const parkingDB_getConvictionBatch = require("../helpers/parkingDB/getConvictionBatch");
const parkingDB_getLastTenConvictionBatches = require("../helpers/parkingDB/getLastTenConvictionBatches");
const parkingDB_isConvictionBatchUpdatable = require("../helpers/parkingDB/isConvictionBatchUpdatable");
const parkingDB_isParkingTicketConvicted = require("../helpers/parkingDB/isParkingTicketConvicted");
const parkingDB_isParkingTicketInConvictionBatch = require("../helpers/parkingDB/isParkingTicketInConvictionBatch");
const parkingDB_getUnreceivedLookupBatches = require("../helpers/parkingDB/getUnreceivedLookupBatches");
const parkingDB_getLookupBatch = require("../helpers/parkingDB/getLookupBatch");
const parkingDB_getUnacknowledgedLookupErrorLog = require("../helpers/parkingDB/getUnacknowledgedLookupErrorLog");
const parkingDB_getOwnershipReconciliationRecords = require("../helpers/parkingDB/getOwnershipReconciliationRecords");
const parkingDB_getParkingOffences = require("../helpers/parkingDB/getParkingOffences");
const parkingDB_getParkingBylaws = require("../helpers/parkingDB/getParkingBylaws");
const parkingDB_getParkingLocations = require("../helpers/parkingDB/getParkingLocations");
const parkingDB_getDatabaseCleanupCounts = require("../helpers/parkingDB/getDatabaseCleanupCounts");
const parkingDB_cleanupParkingTicketsTable = require("../helpers/parkingDB/cleanupParkingTicketsTable");
const parkingDB_cleanupParkingTicketStatusLog = require("../helpers/parkingDB/cleanupParkingTicketStatusLog");
const parkingDB_cleanupParkingTicketRemarksTable = require("../helpers/parkingDB/cleanupParkingTicketRemarksTable");
const parkingDB_cleanupLicencePlateOwnersTable = require("../helpers/parkingDB/cleanupLicencePlateOwnersTable");
const parkingDB_ontario = require("../helpers/parkingDB-ontario");
const parkingDB_reporting = require("../helpers/parkingDB-reporting");
describe("helpers/parkingDB", () => {
    before(() => {
        initializeDatabase_1.initializeDatabase();
    });
    describe("parking ticket queries", () => {
        describe("getParkingTickets()", () => {
            it("should execute with no filters", () => {
                assert.ok(parkingDB_getParkingTickets.getParkingTickets(_globals_1.fakeViewOnlySession, { limit: 1, offset: 0 }));
            });
            it("should execute with ticketNumber filter", () => {
                assert.ok(parkingDB_getParkingTickets.getParkingTickets(_globals_1.fakeViewOnlySession, { limit: 1, offset: 0, ticketNumber: "TEST_TKT" }));
            });
            it("should execute with licencePlateNumber filter", () => {
                assert.ok(parkingDB_getParkingTickets.getParkingTickets(_globals_1.fakeViewOnlySession, { limit: 1, offset: 0, licencePlateNumber: "TEST PLATE" }));
            });
            it("should execute with licencePlateNumberEqual filter", () => {
                assert.ok(parkingDB_getParkingTickets.getParkingTickets(_globals_1.fakeViewOnlySession, { limit: 1, offset: 0, licencePlateNumber: "TEST PLATE" }));
            });
            it("should execute with licencePlateProvince filter", () => {
                assert.ok(parkingDB_getParkingTickets.getParkingTickets(_globals_1.fakeViewOnlySession, { limit: 1, offset: 0, licencePlateProvince: "ON" }));
            });
            it("should execute with licencePlateCountry filter", () => {
                assert.ok(parkingDB_getParkingTickets.getParkingTickets(_globals_1.fakeViewOnlySession, { limit: 1, offset: 0, licencePlateCountry: "CA" }));
            });
            it("should execute with location filter", () => {
                assert.ok(parkingDB_getParkingTickets.getParkingTickets(_globals_1.fakeViewOnlySession, { limit: 1, offset: 0, location: "street" }));
            });
            it("should execute with isResolved=true filter", () => {
                assert.ok(parkingDB_getParkingTickets.getParkingTickets(_globals_1.fakeViewOnlySession, { limit: 1, offset: 0, isResolved: true }));
            });
            it("should execute with isResolved=false filter", () => {
                assert.ok(parkingDB_getParkingTickets.getParkingTickets(_globals_1.fakeViewOnlySession, { limit: 1, offset: 0, isResolved: false }));
            });
        });
        it("should execute getParkingTicket(-1)", () => {
            assert.equal(parkingDB_getParkingTicket.getParkingTicket(-1, _globals_1.fakeViewOnlySession), null);
        });
        it("should execute getParkingTicketID()", () => {
            assert.equal(parkingDB_getParkingTicketID.getParkingTicketID("~~FAKE TICKET NUMBER~~"), null);
        });
        it("should execute getParkingTicketRemarks(-1)", () => {
            assert.equal(parkingDB_getParkingTicketRemarks.getParkingTicketRemarks(-1, _globals_1.fakeViewOnlySession).length, 0);
        });
        it("should execute getParkingTicketStatuses(-1)", () => {
            assert.equal(parkingDB_getParkingTicketStatuses.getParkingTicketStatuses(-1, _globals_1.fakeViewOnlySession).length, 0);
        });
    });
    describe("licence plate queries", () => {
        it("should execute getLicencePlates()", () => {
            assert.ok(parkingDB_getLicencePlates.getLicencePlates({
                limit: 1,
                offset: 0
            }));
        });
        it("should execute getLicencePlateOwner()", () => {
            assert.equal(parkingDB_getLicencePlateOwner.getLicencePlateOwner("CA", "ON", "~~FAKE PLATE NUMBER~~", 0), null);
        });
    });
    describe("conviction batch queries", () => {
        it("should execute getLastTenConvictionBatches()", () => {
            assert.ok(parkingDB_getLastTenConvictionBatches.getLastTenConvictionBatches());
        });
        it("should execute getConvictionBatch()", () => {
            const batch = parkingDB_getConvictionBatch.getConvictionBatch(-1);
            assert.ok(batch === null || batch.lockDate === null);
        });
        it("should execute parkingDB_isConvictionBatchUpdatable()", () => {
            const isConvicted = parkingDB_isConvictionBatchUpdatable.isConvictionBatchUpdatable(-1);
            assert.equal(isConvicted, false);
        });
        it("should execute parkingDB_isParkingTicketConvicted()", () => {
            const isConvicted = parkingDB_isParkingTicketConvicted.isParkingTicketConvicted(-1);
            assert.equal(isConvicted, false);
        });
        it("should execute isParkingTicketInConvictionBatch()", () => {
            const result = parkingDB_isParkingTicketInConvictionBatch.isParkingTicketInConvictionBatch(-1);
            assert.equal(result.inBatch, false);
        });
    });
    describe("lookup batch queries", () => {
        it("should execute getUnreceivedLookupBatches()", () => {
            assert.ok(parkingDB_getUnreceivedLookupBatches.getUnreceivedLookupBatches(true));
        });
        it("should execute getLookupBatch()", () => {
            const batch = parkingDB_getLookupBatch.getLookupBatch(-1);
            assert.ok(batch === null || batch.lockDate === null);
        });
        it("should execute getOwnershipReconciliationRecords()", () => {
            assert.ok(parkingDB_getOwnershipReconciliationRecords.getOwnershipReconciliationRecords());
        });
        it("should execute getUnacknowledgedLookupErrorLog()", () => {
            assert.ok(parkingDB_getUnacknowledgedLookupErrorLog.getUnacknowledgedLookupErrorLog(-1, -1));
        });
    });
    describe("reference queries", () => {
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
    describe("cleanup queries", () => {
        const deleteTimeMillis = Date.now() + (3600 * 1000);
        it("should execute getDatabaseCleanupCounts()", () => {
            assert.ok(parkingDB_getDatabaseCleanupCounts.getDatabaseCleanupCounts());
        });
        it("should execute cleanupParkingTicketsTable()", () => {
            assert.ok(parkingDB_cleanupParkingTicketsTable.cleanupParkingTicketsTable(deleteTimeMillis));
        });
        it("should execute cleanupParkingTicketRemarksTable()", () => {
            assert.ok(parkingDB_cleanupParkingTicketRemarksTable.cleanupParkingTicketRemarksTable(deleteTimeMillis));
        });
        it("should execute cleanupParkingTicketStatusLog()", () => {
            assert.ok(parkingDB_cleanupParkingTicketStatusLog.cleanupParkingTicketStatusLog(deleteTimeMillis));
        });
        it("should execute cleanupLicencePlateOwnersTable()", () => {
            assert.ok(parkingDB_cleanupLicencePlateOwnersTable.cleanupLicencePlateOwnersTable(deleteTimeMillis));
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
