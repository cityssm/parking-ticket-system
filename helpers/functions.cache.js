import cluster from 'node:cluster';
import Debug from 'debug';
import getParkingBylawsFromDatabase from '../database/parkingDB/getParkingBylaws.js';
import getParkingLocationsFromDatabase from '../database/parkingDB/getParkingLocations.js';
const debug = Debug(`parking-ticket-system:functions.cache:${process.pid}`);
let parkingBylaws = [];
export function getParkingBylaws() {
    if (parkingBylaws.length === 0) {
        debug('Cache miss: ParkingBylaws');
        parkingBylaws = getParkingBylawsFromDatabase();
    }
    return parkingBylaws;
}
let parkingLocations = [];
export function getParkingLocations() {
    if (parkingLocations.length === 0) {
        debug('Cache miss: ParkingLocations');
        parkingLocations = getParkingLocationsFromDatabase();
    }
    return parkingLocations;
}
export function clearCacheByTableName(tableName, relayMessage = true) {
    switch (tableName) {
        case 'ParkingBylaws': {
            parkingBylaws = [];
            break;
        }
        case 'ParkingLocations': {
            parkingLocations = [];
            break;
        }
        default: {
            debug(`Ignoring clear cache for unknown table: ${tableName}`);
        }
    }
    try {
        if (relayMessage && cluster.isWorker && process.send !== undefined) {
            const workerMessage = {
                messageType: 'clearCache',
                tableName,
                timeMillis: Date.now(),
                pid: process.pid
            };
            debug(`Sending clear cache from worker: ${tableName}`);
            process.send(workerMessage);
        }
    }
    catch {
        debug('Error sending clear cache message.');
    }
}
process.on('message', (message) => {
    if (message.messageType === 'clearCache' && message.pid !== process.pid) {
        debug(`Clearing cache: ${message.tableName}`);
        clearCacheByTableName(message.tableName, false);
    }
});
