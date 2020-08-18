import * as assert from "assert";

import * as http from "http";
import * as app from "../app";

import { getParkingTickets } from "../helpers/parkingDB";
import { getAllUsers } from "../helpers/usersDB";
import { getModelsByMakeFromCache } from "../helpers/vehicleFns";

import type { Request } from "express";


export const fakeViewOnlySession = {
  id: "",
  cookie: null,
  destroy: null,
  regenerate: null,
  reload: null,
  save: null,
  touch: null,
  user: {
    userProperties: {
      canCreate: false,
      canUpdate: false,
      isAdmin: false,
      isOperator: false
    }
  }
};


export const fakeAdminSession = {
  id: "",
  cookie: null,
  destroy: null,
  regenerate: null,
  reload: null,
  save: null,
  touch: null,
  user: {
    userProperties: {
      canCreate: true,
      canUpdate: true,
      isAdmin: true,
      isOperator: true
    }
  }
};


const fakeRequest: Request = {
  accepted: null,
  accepts: null,
  acceptsCharsets: null,
  acceptsEncodings: null,
  acceptsLanguages: null,
  body: null,
  cookies: null,
  fresh: null,
  get: null,
  header: null,
  host: null,
  hostname: null,
  ip: null,
  ips: null,
  is: null,
  method: null,
  originalUrl: null,
  param: null,
  params: null,
  path: null,
  protocol: null,
  query: null,
  range: null,
  route: null,
  secure: null,
  signedCookies: null,
  stale: null,
  subdomains: null,
  url: null,
  xhr: null
};


export const fakeViewOnlyRequest =
  Object.assign({}, fakeRequest, {
    session: fakeViewOnlySession
  });

export const fakeAdminRequest =
  Object.assign({}, fakeRequest, {
    session: fakeAdminSession
  });


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
    assert.ok(getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0 }));
  });

  it("Ensure users.db exists", () => {
    assert.ok(getAllUsers());
  });

  it("Ensure nhtsa.db exists", () => {
    assert.ok(getModelsByMakeFromCache(""));
  });
});
