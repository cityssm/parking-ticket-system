"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const puppeteer = require("puppeteer");
const http = require("http");
const app = require("../app");
const parkingDB_1 = require("../helpers/parkingDB");
const usersDB = require("../helpers/usersDB");
const vehicleFns_1 = require("../helpers/vehicleFns");
const _globals_1 = require("./_globals");
describe("parking-ticket-system", () => {
    const httpServer = http.createServer(app);
    const portNumber = 54333;
    let serverStarted = false;
    const userName = "__testUser";
    let password = "";
    before(() => {
        httpServer.listen(portNumber);
        httpServer.on("listening", () => {
            serverStarted = true;
        });
        usersDB.inactivateUser(userName);
        password = usersDB.createUser({
            userName,
            firstName: "Test",
            lastName: "User"
        });
    });
    after(() => {
        usersDB.inactivateUser(userName);
        try {
            httpServer.close();
        }
        catch (_e) {
        }
    });
    it("should start server starts on port " + portNumber.toString(), () => {
        assert.ok(serverStarted);
    });
    describe("databases", () => {
        it("should create data/parking.db (or ensure it exists)", () => {
            assert.ok(parkingDB_1.getParkingTickets(_globals_1.fakeViewOnlySession, { limit: 1, offset: 0 }));
        });
        it("should create data/users.db (or ensure it exists)", () => {
            assert.ok(usersDB.getAllUsers());
        });
        it("should create data/nhtsa.db (or ensure it exists)", () => {
            assert.ok(vehicleFns_1.getModelsByMakeFromCache(""));
        });
    });
    const appURL = "http://localhost:" + portNumber.toString();
    describe("simple page tests", () => {
        const docsURL = appURL + "/docs";
        it("should load docs page - " + docsURL, (done) => {
            (() => __awaiter(void 0, void 0, void 0, function* () {
                const browser = yield puppeteer.launch();
                const page = yield browser.newPage();
                yield page.goto(docsURL);
                yield browser.close();
            }))()
                .finally(() => {
                done();
            });
        });
    });
    describe("transaction page tests", () => {
        const pageTests = {
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
                (() => __awaiter(void 0, void 0, void 0, function* () {
                    const browser = yield puppeteer.launch();
                    const page = yield browser.newPage();
                    yield page.goto(appURL);
                    yield page.focus("#login--userName");
                    yield page.type("#login--userName", userName);
                    yield page.focus("#login--password");
                    yield page.type("#login--password", password);
                    const loginFormEle = yield page.$("#form--login");
                    yield loginFormEle.evaluate((formEle) => {
                        formEle.submit();
                    });
                    yield page.waitForNavigation();
                    yield page.goto(appURL + pageURLs.goto);
                    if (pageURLs.waitFor) {
                        yield page.waitForResponse(appURL + pageURLs.waitFor);
                    }
                    yield page.goto(appURL + "/logout");
                    yield browser.close();
                    assert.ok(true);
                }))()
                    .finally(() => {
                    done();
                });
            });
        }
    });
    describe("error page tests", () => {
        it("should return a 404 not found error", (done) => {
            let browser;
            (() => __awaiter(void 0, void 0, void 0, function* () {
                browser = yield puppeteer.launch();
                const page = yield browser.newPage();
                let status = 0;
                yield page.goto(appURL + "/page-not-found")
                    .then((res) => {
                    status = res.status();
                })
                    .catch(() => {
                    assert.fail();
                })
                    .finally(() => {
                    assert.equal(status, 404);
                    done();
                });
            }))()
                .catch(() => {
                assert.fail();
            })
                .finally(() => {
                void browser.close();
            });
        });
        it("should return a 400 bad request error on missing docs", (done) => {
            let browser;
            (() => __awaiter(void 0, void 0, void 0, function* () {
                browser = yield puppeteer.launch();
                const page = yield browser.newPage();
                let status = 0;
                yield page.goto(appURL + "/docs/missing-doc.md")
                    .then((res) => {
                    status = res.status();
                })
                    .catch(() => {
                    assert.fail();
                })
                    .finally(() => {
                    assert.equal(status, 400);
                    done();
                });
            }))()
                .catch(() => {
                assert.fail();
            })
                .finally(() => {
                void browser.close();
            });
        });
        it("should redirect to login if not logged in", (done) => {
            (() => __awaiter(void 0, void 0, void 0, function* () {
                const browser = yield puppeteer.launch();
                const page = yield browser.newPage();
                yield page.goto(appURL + "/plates");
                assert.ok(page.url().includes("/login"));
                yield browser.close();
            }))()
                .finally(() => {
                done();
            });
        });
        it("should redirect to login if incorrect user name/password", (done) => {
            let isLoginPage = false;
            const p = (() => __awaiter(void 0, void 0, void 0, function* () {
                const browser = yield puppeteer.launch();
                const page = yield browser.newPage();
                yield page.goto(appURL + "/login");
                yield page.focus("#login--userName");
                yield page.type("#login--userName", userName);
                yield page.focus("#login--password");
                yield page.type("#login--password", password + "-incorrect");
                const loginFormEle = yield page.$("#form--login");
                yield loginFormEle.evaluate((formEle) => {
                    formEle.submit();
                });
                yield page.waitForNavigation();
                isLoginPage = page.url().includes("/login");
                yield browser.close();
            }))();
            p.catch(() => {
            })
                .finally(() => {
                assert.ok(isLoginPage);
                done();
            });
        });
        it("should redirect to dashboard if insufficient user permissions", (done) => {
            let isDashboardPage = false;
            const p = (() => __awaiter(void 0, void 0, void 0, function* () {
                const browser = yield puppeteer.launch();
                const page = yield browser.newPage();
                yield page.goto(appURL + "/login");
                yield page.focus("#login--userName");
                yield page.type("#login--userName", userName);
                yield page.focus("#login--password");
                yield page.type("#login--password", password);
                const loginFormEle = yield page.$("#form--login");
                yield loginFormEle.evaluate((formEle) => {
                    formEle.submit();
                });
                yield page.waitForNavigation();
                yield page.goto(appURL + "/admin/userManagement");
                isDashboardPage = page.url().includes("/dashboard");
                yield browser.close();
            }))();
            p.catch(() => {
            })
                .finally(() => {
                assert.ok(isDashboardPage);
                done();
            });
        });
    });
});
