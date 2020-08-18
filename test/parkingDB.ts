import * as assert from "assert";

import { fakeViewOnlySession } from "./1_serverStart";

import * as parkingDB from "../helpers/parkingDB";
import * as parkingDB_cleanup from "../helpers/parkingDB-cleanup";


describe("parkingDB", () => {

  it("getParkingTickets()", () => {
    assert.ok(parkingDB.getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0 }));
  });

  it("getParkingTicket(-1)", () => {
    assert.equal(parkingDB.getParkingTicket(-1, fakeViewOnlySession), null);
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
