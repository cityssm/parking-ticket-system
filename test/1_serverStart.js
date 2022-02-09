import { exec } from "child_process";
import * as assert from "assert";
import * as http from "http";
import { app } from "../app.js";
import { getParkingTickets } from "../helpers/parkingDB/getParkingTickets.js";
import { getModelsByMakeFromCache } from "../helpers/functions.vehicle.js";
import { fakeViewOnlySession } from "./_globals.js";
describe("parking-ticket-system", () => {
    const httpServer = http.createServer(app);
    const portNumber = 4000;
    let serverStarted = false;
    before(async () => {
        httpServer.listen(portNumber);
        httpServer.on("listening", () => {
            serverStarted = true;
        });
    });
    after(() => {
        try {
            httpServer.close();
        }
        catch {
        }
    });
    it("should start server starts on port " + portNumber.toString(), () => {
        assert.ok(serverStarted);
    });
    describe("databases", () => {
        it("should create data/parking.db (or ensure it exists)", () => {
            assert.ok(getParkingTickets(fakeViewOnlySession, { limit: 1, offset: 0 }));
        });
        it("should create data/nhtsa.db (or ensure it exists)", () => {
            assert.ok(getModelsByMakeFromCache(""));
        });
    });
    describe("Cypress tests", () => {
        it("should run Cypress tests", (done) => {
            const childProcess = exec("cypress run", (error, stdout, stderr) => {
                console.log(stdout);
                console.error(stderr);
            });
            childProcess.on("exit", (code) => {
                assert.ok(code === 0);
                done();
            });
        });
    });
});
