import http from 'node:http';
import Debug from 'debug';
import exitHook from 'exit-hook';
import { app } from '../app.js';
import { getConfigProperty } from '../helpers/functions.config.js';
const debug = Debug(`parking-ticket-system:wwwProcess:${process.pid}`);
function onError(error) {
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
}
function onListening(server) {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? `pipe ${addr}`
        : `port ${addr?.port.toString() ?? ''}`;
    debug(`Listening on ${bind}`);
}
process.title = `${getConfigProperty('application.applicationName')} (Worker)`;
const httpPort = getConfigProperty('application.httpPort');
const httpServer = http.createServer(app);
httpServer.listen(httpPort);
httpServer.on('error', onError);
httpServer.on('listening', () => {
    onListening(httpServer);
});
exitHook(() => {
    debug('Closing HTTP');
    httpServer.close();
});
