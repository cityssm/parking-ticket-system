#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app = require("../app");
const log = require("fancy-log");
const http = require("http");
const https = require("https");
const fs = require("fs");
const child_process_1 = require("child_process");
const configFns = require("../helpers/configFns");
const onError = (error) => {
    if (error.syscall !== "listen") {
        throw error;
    }
    let doProcessExit = false;
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
};
const onListening = (server) => {
    const addr = server.address();
    const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port.toString();
    log.info("Listening on " + bind);
};
const httpPort = configFns.getProperty("application.httpPort");
if (httpPort) {
    const httpServer = http.createServer(app);
    httpServer.listen(httpPort);
    httpServer.on("error", onError);
    httpServer.on("listening", () => {
        onListening(httpServer);
    });
    log.info("HTTP listening on " + httpPort.toString());
}
const httpsConfig = configFns.getProperty("application.https");
if (httpsConfig) {
    const httpsServer = https.createServer({
        key: fs.readFileSync(httpsConfig.keyPath),
        cert: fs.readFileSync(httpsConfig.certPath),
        passphrase: httpsConfig.passphrase
    }, app);
    httpsServer.listen(httpsConfig.port);
    httpsServer.on("error", onError);
    httpsServer.on("listening", () => {
        onListening(httpsServer);
    });
    log.info("HTTPS listening on " + httpsConfig.port.toString());
}
if (configFns.getProperty("application.task_nhtsa.runTask")) {
    child_process_1.fork("./tasks/nhtsaChildProcess");
}
