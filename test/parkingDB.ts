import * as assert from "assert";

import { fakeViewOnlySession } from "./_globals";

import { initializeDatabase } from "../helpers/parkingDB/initializeDatabase";

// Parking tickets
import * as parkingDB_getParkingTickets from "../helpers/parkingDB/getParkingTickets";
import * as parkingDB_getParkingTicket from "../helpers/parkingDB/getParkingTicket";
import * as parkingDB_getParkingTicketID from "../helpers/parkingDB/getParkingTicketID";
import * as parkingDB_getParkingTicketRemarks from "../helpers/parkingDB/getParkingTicketRemarks";
import * as parkingDB_getParkingTicketStatuses from "../helpers/parkingDB/getParkingTicketStatuses";

// Licence Plates
import * as parkingDB_getLicencePlateOwner from "../helpers/parkingDB/getLicencePlateOwner";
import * as parkingDB_getLicencePlates from "../helpers/parkingDB/getLicencePlates";

// Conviction batches
import * as parkingDB_getConvictionBatch from "../helpers/parkingDB/getConvictionBatch";
import * as parkingDB_getLastTenConvictionBatches from "../helpers/parkingDB/getLastTenConvictionBatches";
import * as parkingDB_isConvictionBatchUpdatable from "../helpers/parkingDB/isConvictionBatchUpdatable";
import * as parkingDB_isParkingTicketConvicted from "../helpers/parkingDB/isParkingTicketConvicted";
import * as parkingDB_isParkingTicketInConvictionBatch from "../helpers/parkingDB/isParkingTicketInConvictionBatch";

// Lookup batches
import * as parkingDB_getUnreceivedLookupBatches from "../helpers/parkingDB/getUnreceivedLookupBatches";
import * as parkingDB_getLookupBatch from "../helpers/parkingDB/getLookupBatch";
import * as parkingDB_getUnacknowledgedLookupErrorLog from "../helpers/parkingDB/getUnacknowledgedLookupErrorLog";
import * as parkingDB_getOwnershipReconciliationRecords from "../helpers/parkingDB/getOwnershipReconciliationRecords";

// Reference
import * as parkingDB_getParkingOffences from "../helpers/parkingDB/getParkingOffences";
import * as parkingDB_getParkingBylaws from "../helpers/parkingDB/getParkingBylaws";
import * as parkingDB_getParkingLocations from "../helpers/parkingDB/getParkingLocations";

// Cleanup
import * as parkingDB_getDatabaseCleanupCounts from "../helpers/parkingDB/getDatabaseCleanupCounts";
import * as parkingDB_cleanupParkingTicketsTable from "../helpers/parkingDB/cleanupParkingTicketsTable";
import * as parkingDB_cleanupParkingTicketStatusLog from "../helpers/parkingDB/cleanupParkingTicketStatusLog";
import * as parkingDB_cleanupParkingTicketRemarksTable from "../helpers/parkingDB/cleanupParkingTicketRemarksTable";
import * as parkingDB_cleanupLicencePlateOwnersTable from "../helpers/parkingDB/cleanupLicencePlateOwnersTable";

import * as parkingDB_ontario from "../helpers/parkingDB-ontario";
import * as parkingDB_reporting from "../helpers/parkingDB-reporting";


describe("helpers/parkingDB", () => {

  before(() => {
    initializeDatabase();
  });

  describe("parking ticket queries", () => {

    describe("getParkingTickets()", () => {

      it("should execute with no filters", () => {
        assert.ok(parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0 }));
      });

      it("should execute with ticketNumber filter", () => {
        assert.ok(parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0, ticketNumber: "TEST_TKT" }));
      });

      it("should execute with licencePlateNumber filter", () => {
        assert.ok(parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0, licencePlateNumber: "TEST PLATE" }));
      });

      it("should execute with licencePlateNumberEqual filter", () => {
        assert.ok(parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0, licencePlateNumber: "TEST PLATE" }));
      });

      it("should execute with licencePlateProvince filter", () => {
        assert.ok(parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0, licencePlateProvince: "ON" }));
      });

      it("should execute with licencePlateCountry filter", () => {
        assert.ok(parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0, licencePlateCountry: "CA" }));
      });

      it("should execute with location filter", () => {
        assert.ok(parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0, location: "street" }));
      });

      it("should execute with isResolved=true filter", () => {
        assert.ok(parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0, isResolved: true }));
      });

      it("should execute with isResolved=false filter", () => {
        assert.ok(parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0, isResolved: false }));
      });

    });


    it("should execute getParkingTicket(-1)", () => {
      assert.equal(parkingDB_getParkingTicket.getParkingTicket(-1, fakeViewOnlySession), null);
    });

    it("should execute getParkingTicketID()", () => {
      assert.equal(parkingDB_getParkingTicketID.getParkingTicketID("~~FAKE TICKET NUMBER~~"), null);
    });

    it("should execute getParkingTicketRemarks(-1)", () => {
      assert.equal(parkingDB_getParkingTicketRemarks.getParkingTicketRemarks(-1, fakeViewOnlySession).length, 0);
    });

    it("should execute getParkingTicketStatuses(-1)", () => {
      assert.equal(parkingDB_getParkingTicketStatuses.getParkingTicketStatuses(-1, fakeViewOnlySession).length, 0);
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
