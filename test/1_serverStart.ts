import * as assert from "assert";

import * as http from "http";
import * as app from "../app";

import { getParkingTickets } from "../helpers/parkingDB";
import { getAllUsers } from "../helpers/usersDB";
import { getModelsByMakeFromCache } from "../helpers/vehicleFns";


export const fakeSession = {
  id: "",
  cookie: null,
  destroy: null,
  regenerate: null,
  reload: null,
  save: null,
  touch: null,
  user: {
    userProperties: { canUpdate: false }
  }
};


describe("parking-ticket-system", () => {

  const httpServer = http.createServer(app);
  const portNumber = 54333;


  let serverStarted = false;

  before(() => {

    httpServer.listen(portNumber);

    httpServer.on("listening", () => {
      serverStarted = true;
      httpServer.close();
    });
  });

  it("Ensure server starts on port " + portNumber.toString(), () => {
    assert.ok(serverStarted);
  });

  it("Ensure parking.db exists", () => {
    assert.ok(getParkingTickets(fakeSession, { limit: 1, offset: 0 }));
  });

  it("Ensure users.db exists", () => {
    assert.ok(getAllUsers());
  });

  it("Ensure nhtsa.db exists", () => {
    assert.ok(getModelsByMakeFromCache(""));
  });
});
