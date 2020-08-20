import * as assert from "assert";

import { fakeViewOnlySession } from "./1_serverStart";

import { initParkingDB } from "../helpers/dbInit";

import * as parkingDB from "../helpers/parkingDB";
import * as parkingDB_cleanup from "../helpers/parkingDB-cleanup";
import * as parkingDB_convict from "../helpers/parkingDB-convict";
import * as parkingDB_lookup from "../helpers/parkingDB-lookup";
import * as parkingDB_ontario from "../helpers/parkingDB-ontario";
import * as parkingDB_related from "../helpers/parkingDB-related";
import * as parkingDB_reporting from "../helpers/parkingDB-reporting";


describe("helpers/parkingDB", () => {

  before(() => {
    initParkingDB();
  });

  it("should execute getParkingTickets()", () => {
    assert.ok(parkingDB.getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0 }));
  });

  it("should execute getParkingTicket(-1)", () => {
    assert.equal(parkingDB.getParkingTicket(-1, fakeViewOnlySession), null);
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
