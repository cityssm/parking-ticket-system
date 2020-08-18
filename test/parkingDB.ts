import * as assert from "assert";

import { fakeSession } from "./1_serverStart";

import * as parkingDB from "../helpers/parkingDB";


describe("parkingDB", () => {

  it("getParkingTickets()", () => {
    assert.ok(parkingDB.getParkingTickets(fakeSession, { limit: 1, offset: 0 }));
  });

  it("getParkingTicket()", () => {
    assert.equal(parkingDB.getParkingTicket(-1, fakeSession), null);
  });
});
