import * as assert from "assert";

import * as puppeteer from "puppeteer";

import * as http from "http";
import * as app from "../app";

import { getParkingTickets } from "../helpers/parkingDB";
import * as usersDB from "../helpers/usersDB";
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


export const fakeRequest: Request = {
  accepted: null,
  accepts: null,
  acceptsCharsets: null,
  acceptsEncodings: null,
  acceptsLanguages: null,
  app: null,
  baseUrl: null,
  body: null,
  cookies: null,
  complete: null,
  connection: null,
  destroy: null,
  destroyed: null,
  fresh: null,
  get: null,
  header: null,
  headers: null,
  host: null,
  hostname: null,
  httpVersion: null,
  httpVersionMajor: null,
  httpVersionMinor: null,
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
  rawHeaders: null,
  rawTrailers: null,
  readable: null,
  readableLength: null,
  readableHighWaterMark: null,
  readableObjectMode: null,
  route: null,
  secure: null,
  setTimeout: null,
  signedCookies: null,
  socket: null,
  stale: null,
  subdomains: null,
  trailers: null,
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
    });
  });

  after(() => {
    try {
      httpServer.close();
    } catch (_e) {
      // ignore
    }
  });

  it("should start server starts on port " + portNumber.toString(), () => {
    assert.ok(serverStarted);
  });

  describe("databases", () => {

    it("should create data/parking.db (or ensure it exists)", () => {
      assert.ok(getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0 }));
    });

    it("should create data/users.db (or ensure it exists)", () => {
      assert.ok(usersDB.getAllUsers());
    });

    it("should create data/nhtsa.db (or ensure it exists)", () => {
      assert.ok(getModelsByMakeFromCache(""));
    });
  });

  const appURL = "http://localhost:" + portNumber.toString();

  describe("simple page tests", () => {

    const docsURL = appURL + "/docs";

    it("should load docs page - " + docsURL, (done) => {
      (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(docsURL);

        await browser.close();
      })()
        .finally(() => {
          done();
        });
    });

  });

  describe("transaction page tests", () => {

    const userName = "__testUser";
    let password = "";

    before(() => {

      // ensure the test user is not active
      usersDB.inactivateUser(userName);

      password = usersDB.createUser({
        userName: userName,
        firstName: "Test",
        lastName: "User"
      }) as string;
    });

    after(() => {
      usersDB.inactivateUser(userName);
    });

    it("should login, perform a ticket search, and log out - ", (done) => {

      (async() => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Load the login page

        await page.goto(appURL);

        await page.focus("#login--userName");
        await page.type("#login--userName", userName);

        await page.focus("#login--password");
        await page.type("#login--password", password);

        const loginFormEle = await page.$("#form--login");
        await loginFormEle.evaluate((formEle: HTMLFormElement) => {
          formEle.submit();
        });

        await page.waitForNavigation();

        // Navigate to the ticket search

        await page.goto(appURL + "/tickets");

        // Log out

        await page.goto(appURL + "/logout");

        await browser.close();
      })()
        .finally(() => {
          done();
        });
    });
  });
});
