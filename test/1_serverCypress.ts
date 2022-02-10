/* eslint-disable unicorn/filename-case */

import { portNumber } from "./_globals.js";

import { exec } from "child_process";

import * as assert from "assert";

import * as http from "http";
import { app } from "../app.js";


describe("parking-ticket-system", () => {

  const httpServer = http.createServer(app);

  let serverStarted = false;

  before(async() => {

    httpServer.listen(portNumber);

    httpServer.on("listening", () => {
      serverStarted = true;
    });

  });

  after(() => {

    try {
      httpServer.close();
    } catch {
      // ignore
    }
  });

  it("should start server starts on port " + portNumber.toString(), () => {
    assert.ok(serverStarted);
  });

  describe("Cypress tests", () => {

    it("should run Cypress tests", (done) => {

      const childProcess = exec("cypress run", (_error, stdout, stderr) => {
        console.log(stdout);
        console.error(stderr);
      });

      childProcess.on("exit", (code) => {
        assert.ok(code === 0);
        done();
      })
    });
  });
});