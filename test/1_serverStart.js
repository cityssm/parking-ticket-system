"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fakeAdminRequest = exports.fakeViewOnlyRequest = exports.fakeRequest = exports.fakeAdminSession = exports.fakeViewOnlySession = void 0;
const assert = require("assert");
const http = require("http");
const app = require("../app");
const parkingDB_1 = require("../helpers/parkingDB");
const usersDB_1 = require("../helpers/usersDB");
const vehicleFns_1 = require("../helpers/vehicleFns");
exports.fakeViewOnlySession = {
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
exports.fakeAdminSession = {
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
exports.fakeRequest = {
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
exports.fakeViewOnlyRequest = Object.assign({}, exports.fakeRequest, {
    session: exports.fakeViewOnlySession
});
exports.fakeAdminRequest = Object.assign({}, exports.fakeRequest, {
    session: exports.fakeAdminSession
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
        assert.ok(parkingDB_1.getParkingTickets(exports.fakeViewOnlySession, { limit: 1, offset: 0 }));
    });
    it("Ensure users.db exists", () => {
        assert.ok(usersDB_1.getAllUsers());
    });
    it("Ensure nhtsa.db exists", () => {
        assert.ok(vehicleFns_1.getModelsByMakeFromCache(""));
    });
});
