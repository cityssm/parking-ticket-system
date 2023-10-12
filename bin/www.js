import { fork } from 'node:child_process';
import http from 'node:http';
import Debug from 'debug';
import exitHook from 'exit-hook';
import { app } from '../app.js';
import * as configFunctions from '../helpers/functions.config.js';
const debug = Debug('parking-ticket-system:www');
let httpServer;
const onError = (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    let doProcessExit = false;
    switch (error.code) {
        case 'EACCES': {
            debug('Requires elevated privileges');
            doProcessExit = true;
            break;
        }
        case 'EADDRINUSE': {
            debug('Port is already in use.');
            doProcessExit = true;
            break;
        }
        default: {
            throw error;
        }
    }
    if (doProcessExit) {
        process.exit(1);
    }
};
const onListening = (server) => {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + (addr?.port.toString() ?? '');
    debug('Listening on ' + bind);
};
const httpPort = configFunctions.getProperty('application.httpPort');
httpServer = http.createServer(app);
httpServer.listen(httpPort);
httpServer.on('error', onError);
httpServer.on('listening', () => {
    onListening(httpServer);
});
debug('HTTP listening on ' + httpPort.toString());
if (configFunctions.getProperty('application.task_nhtsa.runTask')) {
    fork('./tasks/nhtsaChildProcess.js');
}
exitHook(() => {
    if (httpServer) {
        debug('Closing HTTP');
        httpServer.close();
        httpServer = undefined;
    }
});
