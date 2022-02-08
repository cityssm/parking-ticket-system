import { app } from "../app.js";
import http from "http";
import { fork } from "child_process";
import * as configFunctions from "../helpers/functions.config.js";
import debug from "debug";
const debugWWW = debug("parking-ticket-system:www");
const onError = (error) => {
    if (error.syscall !== "listen") {
        throw error;
    }
    let doProcessExit = false;
    switch (error.code) {
        case "EACCES":
            debugWWW("Requires elevated privileges");
            doProcessExit = true;
            break;
        case "EADDRINUSE":
            debugWWW("Port is already in use.");
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
    debugWWW("Listening on " + bind);
};
const httpPort = configFunctions.getProperty("application.httpPort");
if (httpPort) {
    const httpServer = http.createServer(app);
    httpServer.listen(httpPort);
    httpServer.on("error", onError);
    httpServer.on("listening", () => {
        onListening(httpServer);
    });
    debugWWW("HTTP listening on " + httpPort.toString());
}
if (configFunctions.getProperty("application.task_nhtsa.runTask")) {
    fork("./tasks/nhtsaChildProcess");
}
