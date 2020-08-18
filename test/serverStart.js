"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const http = require("http");
const app = require("../app");
const parkingDB_1 = require("../helpers/parkingDB");
const usersDB_1 = require("../helpers/usersDB");
const vehicleFns_1 = require("../helpers/vehicleFns");
describe("parking-ticket-system", () => {
    const httpServer = http.createServer(app);
    const portNumber = 54333;
    const fakeSession = {
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
        assert.ok(parkingDB_1.getParkingTickets(fakeSession, { limit: 1, offset: 0 }));
    });
    it("Ensure users.db exists", () => {
        assert.ok(usersDB_1.getAllUsers());
    });
    it("Ensure nhtsa.db exists", () => {
        assert.ok(vehicleFns_1.getModelsByMakeFromCache(""));
    });
});
