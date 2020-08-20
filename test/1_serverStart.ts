import * as assert from "assert";

import * as puppeteer from "puppeteer";

import * as http from "http";
import * as app from "../app";

import { getParkingTickets } from "../helpers/parkingDB";
import * as usersDB from "../helpers/usersDB";
import { getModelsByMakeFromCache } from "../helpers/vehicleFns";

import { fakeViewOnlySession } from "./_globals";


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
        userName,
        firstName: "Test",
        lastName: "User"
      }) as string;
    });

    after(() => {
      usersDB.inactivateUser(userName);
    });

    const pageTests: {
      [pageName: string]: {
        goto: string;
        waitFor: string | null;
      };
    } = {
      reports: {
        goto: "/reports",
        waitFor: null
      },
      tickets: {
        goto: "/tickets",
        waitFor: "/tickets/doGetTickets"
      },
      plates: {
        goto: "/plates",
        waitFor: "/plates/doGetLicencePlates"
      }
    };

    for (const pageName of Object.keys(pageTests)) {

      it("should login, navigate to " + pageName + ", and log out", (done) => {

        const pageURLs = pageTests[pageName];

        (async () => {
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

          await page.goto(appURL + pageURLs.goto);

          if (pageURLs.waitFor) {
            await page.waitForResponse(appURL + pageURLs.waitFor);
          }

          // Log out

          await page.goto(appURL + "/logout");

          await browser.close();
        })()
          .finally(() => {
            done();
          });
      });
    }

  });

  describe("error page test", () => {

    it("should return a 404 error", (done) => {

      let browser;

      (async() => {
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(appURL + "/page-not-found")
          .then((res) => {
            assert.equal(res.status, 404);
          })
          .catch(() => {
            assert.fail();
          })
          .finally(() => {
            done();
          });
      })()
        .catch(() => {
          assert.fail();
        })
        .finally(() => {
          browser.close();
        });
    });

  });
});
