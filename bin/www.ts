#!/usr/bin/env node

import * as app from "../app";

import * as log from "fancy-log";

import * as http from "http";
import * as https from "https";
import * as fs from "fs";

import * as configFns from "../helpers/configFns";
import type { ConfigHttpsConfig } from "../helpers/ptsTypes";

function onError(error: Error) {

  if (error.syscall !== "listen") {
    throw error;
  }

  let doProcessExit = false;

  // handle specific listen errors with friendly messages
  switch (error.code) {

    case "EACCES":
      log.error("Requires elevated privileges");
      doProcessExit = true;
      break;

    case "EADDRINUSE":
      log.error("Port is already in use.");
      doProcessExit = true;
      break;

    default:
      throw error;
  }

  if (doProcessExit) {
    process.exit(1);
  }
}

function onListening(server: http.Server | https.Server) {

  const addr = server.address();

  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port;

  log.info("Listening on " + bind);

}

/**
 * Initialize HTTP
 */

const httpPort = configFns.getProperty("application.httpPort");

if (httpPort) {

  const httpServer = http.createServer(app);

  httpServer.listen(httpPort);

  httpServer.on("error", onError);
  httpServer.on("listening", function() {
    onListening(httpServer);
  });

  log.info("HTTP listening on " + httpPort);
}

/**
 * Initialize HTTPS
 */

const httpsConfig = <ConfigHttpsConfig>configFns.getProperty("application.https");

if (httpsConfig) {

  const httpsServer = https.createServer({
    key: fs.readFileSync(httpsConfig.keyPath),
    cert: fs.readFileSync(httpsConfig.certPath),
    passphrase: httpsConfig.passphrase
  }, app);

  httpsServer.listen(httpsConfig.port);

  httpsServer.on("error", onError);

  httpsServer.on("listening", function() {
    onListening(httpsServer);
  });

  log.info("HTTPS listening on " + httpsConfig.port);

}
