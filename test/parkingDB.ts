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


describe("parkingDB", () => {

  before(() => {
    initParkingDB();
  });

  it("Execute getParkingTickets()", () => {
    assert.ok(parkingDB.getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0 }));
  });

  it("Execute getParkingTicket(-1)", () => {
    assert.equal(parkingDB.getParkingTicket(-1, fakeViewOnlySession), null);
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
