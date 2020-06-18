#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app = require("../app");
const log = require("fancy-log");
const http = require("http");
const https = require("https");
const fs = require("fs");
const configFns = require("../helpers/configFns");
function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }
    switch (error.code) {
        case "EACCES":
            log.error("Requires elevated privileges");
            process.exit(1);
        case "EADDRINUSE":
            log.error("Port is already in use.");
            process.exit(1);
        default:
            throw error;
    }
}
function onListening(server) {
    const addr = server.address();
    const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port;
    log.info("Listening on " + bind);
}
const httpPort = configFns.getProperty("application.httpPort");
if (httpPort) {
    const httpServer = http.createServer(app);
    httpServer.listen(httpPort);
    httpServer.on("error", onError);
    httpServer.on("listening", function () {
        onListening(httpServer);
    });
    log.info("HTTP listening on " + httpPort);
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
    httpsServer.on("listening", function () {
        onListening(httpsServer);
    });
    log.info("HTTPS listening on " + httpsConfig.port);
}
