import * as assert from "assert";

import puppeteer from "puppeteer";

import * as http from "http";
import app from "../app.js";

import { getParkingTickets } from "../helpers/parkingDB/getParkingTickets.js";

import { getAllUsers } from "../helpers/usersDB/getAllUsers.js";
import { createUser } from "../helpers/usersDB/createUser.js";
import { inactivateUser } from "../helpers/usersDB/inactivateUser.js";
import { updateUserProperty } from "../helpers/usersDB/updateUserProperty.js";

import { getModelsByMakeFromCache } from "../helpers/functions.vehicle.js";

import { fakeViewOnlySession, userName } from "./_globals.js";


describe("parking-ticket-system", () => {

  const httpServer = http.createServer(app);
  const portNumber = 54333;

  let serverStarted = false;

  let password = "";

  before(() => {

    httpServer.listen(portNumber);

    httpServer.on("listening", () => {
      serverStarted = true;
    });

    // ensure the test user is not active
    inactivateUser(userName);

    password = createUser({
      userName,
      firstName: "Test",
      lastName: "User"
    }) as string;

    updateUserProperty({
      userName,
      propertyName: "isOperator",
      propertyValue: "false"
    });

    updateUserProperty({
      userName,
      propertyName: "isAdmin",
      propertyValue: "false"
    });

    updateUserProperty({
      userName,
      propertyName: "canUpdate",
      propertyValue: "false"
    });

    updateUserProperty({
      userName,
      propertyName: "canCreate",
      propertyValue: "false"
    });
  });

  after(() => {

    inactivateUser(userName);

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
      assert.ok(getAllUsers());
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

          assert.ok(true);
        })()
          .finally(() => {
            done();
          });
      });
    }

  });

  describe("error page tests", () => {

    it("should return a 404 not found error", (done) => {

      let browser: puppeteer.Browser;

      (async () => {
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        let status = 0;

        await page.goto(appURL + "/page-not-found")
          .then((res) => {
            status = res.status();
          })
          .catch(() => {
            assert.fail();
          })
          .finally(() => {
            assert.strictEqual(status, 404);
            done();
          });
      })()
        .catch(() => {
          assert.fail();
        })
        .finally(() => {
          // eslint-disable-next-line no-void
          void browser.close();
        });
    });

    it("should return a 400 bad request error on missing docs", (done) => {

      let browser: puppeteer.Browser;

      (async () => {
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        let status = 0;

        await page.goto(appURL + "/docs/missing-doc.md")
          .then((res) => {
            status = res.status();
          })
          .catch(() => {
            assert.fail();
          })
          .finally(() => {
            assert.strictEqual(status, 400);
            done();
          });
      })()
        .catch(() => {
          assert.fail();
        })
        .finally(() => {
          // eslint-disable-next-line no-void
          void browser.close();
        });
    });

    it("should redirect to login if not logged in", (done) => {

      (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(appURL + "/plates");

        assert.ok(page.url().includes("/login"));

        await browser.close();
      })()
        .finally(() => {
          done();
        });
    });

    it("should redirect to login if incorrect user name/password", (done) => {

      let isLoginPage = false;

      const p = (async () => {

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(appURL + "/login");

        await page.focus("#login--userName");
        await page.type("#login--userName", userName);

        await page.focus("#login--password");
        await page.type("#login--password", password + "-incorrect");

        const loginFormEle = await page.$("#form--login");
        await loginFormEle.evaluate((formEle: HTMLFormElement) => {
          formEle.submit();
        });

        await page.waitForNavigation();

        isLoginPage = page.url().includes("/login");

        await browser.close();
      })();

      p.catch(() => {
        // ignore
      })
        .finally(() => {
          assert.ok(isLoginPage);
          done();
        });
    });

    it("should redirect to dashboard if insufficient user permissions", (done) => {

      let isDashboardPage = false;

      const p = (async () => {

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(appURL + "/login");

        await page.focus("#login--userName");
        await page.type("#login--userName", userName);

        await page.focus("#login--password");
        await page.type("#login--password", password);

        const loginFormEle = await page.$("#form--login");
        await loginFormEle.evaluate((formEle: HTMLFormElement) => {
          formEle.submit();
        });

        await page.waitForNavigation();

        await page.goto(appURL + "/admin/userManagement");

        isDashboardPage = page.url().includes("/dashboard");

        await browser.close();
      })();

      p.catch(() => {
        // ignore
      })
        .finally(() => {
          assert.ok(isDashboardPage);
          done();
        });
    });

  });

  describe("admin page tests", () => {

    before(() => {

      updateUserProperty({
        userName,
        propertyName: "isAdmin",
        propertyValue: "true"
      });

      updateUserProperty({
        userName,
        propertyName: "canUpdate",
        propertyValue: "true"
      });

      updateUserProperty({
        userName,
        propertyName: "canCreate",
        propertyValue: "true"
      });
    });

    after(() => {

      updateUserProperty({
        userName,
        propertyName: "isOperator",
        propertyValue: "false"
      });

      updateUserProperty({
        userName,
        propertyName: "isAdmin",
        propertyValue: "false"
      });

      updateUserProperty({
        userName,
        propertyName: "canUpdate",
        propertyValue: "false"
      });

      updateUserProperty({
        userName,
        propertyName: "canCreate",
        propertyValue: "false"
      });
    });

    it("should open all admin pages", (done) => {

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

        // Navigate to the admin pages

        await page.goto(appURL + "/tickets/new");
        await page.goto(appURL + "/admin/userManagement");
        await page.goto(appURL + "/admin/cleanup");
        await page.goto(appURL + "/admin/offences");
        await page.goto(appURL + "/admin/locations");
        await page.goto(appURL + "/admin/bylaws");

        // Log out

        await page.goto(appURL + "/logout");

        await browser.close();

        assert.ok(true);
      })()
        .finally(() => {
          done();
        });
    });
  });
});
