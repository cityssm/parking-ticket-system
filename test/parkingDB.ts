import * as assert from "assert";

import { fakeViewOnlySession } from "./_globals";

import { initParkingDB } from "../helpers/dbInit";

import * as parkingDB_getParkingTickets from "../helpers/parkingDB/getParkingTickets";
import * as parkingDB_getParkingTicket from "../helpers/parkingDB/getParkingTicket";

import * as parkingDB_getConvictionBatch from "../helpers/parkingDB/getConvictionBatch";
import * as parkingDB_getLastTenConvictionBatches from "../helpers/parkingDB/getLastTenConvictionBatches";

import * as parkingDB_getOwnershipReconciliationRecords from "../helpers/parkingDB/getOwnershipReconciliationRecords";
import * as parkingDB_getUnreceivedLookupBatches from "../helpers/parkingDB/getUnreceivedLookupBatches";
import * as parkingDB_getUnacknowledgedLookupErrorLog from "../helpers/parkingDB/getUnacknowledgedLookupErrorLog";

import * as parkingDB_cleanup from "../helpers/parkingDB-cleanup";

import * as parkingDB_ontario from "../helpers/parkingDB-ontario";
import * as parkingDB_related from "../helpers/parkingDB-related";
import * as parkingDB_reporting from "../helpers/parkingDB-reporting";


describe("helpers/parkingDB", () => {

  before(() => {
    initParkingDB();
  });

  it("should execute getParkingTickets()", () => {
    assert.ok(parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0 }));
  });

  it("should execute getParkingTicket(-1)", () => {
    assert.equal(parkingDB_getParkingTicket.getParkingTicket(-1, fakeViewOnlySession), null);
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
