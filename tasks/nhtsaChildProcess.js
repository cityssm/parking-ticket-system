import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async';
import exitHook from 'exit-hook';
import * as parkingDB from '../database/parkingDB.js';
import * as vehicleFunctions from '../helpers/functions.vehicle.js';
import * as configFunctions from '../helpers/functions.config.js';
import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import Debug from 'debug';
const debug = Debug('parking-ticket-system:task:nhtsaChildProcess');
const initDate = new Date();
initDate.setMonth(initDate.getMonth() - 1);
let cutoffDate = dateTimeFns.dateToInteger(initDate);
let terminateTask = false;
const doTask = async () => {
    const vehicleNCICs = parkingDB.getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate);
    for (const ncicRecord of vehicleNCICs) {
        if (terminateTask) {
            break;
        }
        cutoffDate = ncicRecord.recordDateMax;
        const vehicleMake = vehicleFunctions.getMakeFromNCIC(ncicRecord.vehicleNCIC);
        debug('Processing ' + vehicleMake);
        await vehicleFunctions.getModelsByMake(vehicleMake);
    }
};
let timeoutId;
let intervalId;
export const scheduleRun = async () => {
    const firstScheduleDate = new Date();
    firstScheduleDate.setHours(configFunctions.getProperty('application.task_nhtsa.executeHour'));
    firstScheduleDate.setDate(firstScheduleDate.getDate() + 1);
    debug('NHTSA task scheduled for ' + firstScheduleDate.toString());
    timeoutId = setTimeout(() => {
        if (terminateTask) {
            return;
        }
        debug('NHTSA task starting');
        intervalId = setIntervalAsync(doTask, 86400 * 1000);
        doTask();
    }, firstScheduleDate.getTime() - Date.now());
};
scheduleRun();
exitHook(() => {
    terminateTask = true;
    debug('Exit hook called');
    try {
        clearTimeout(timeoutId);
        debug('Timeout cleared');
    }
    catch {
    }
    try {
        clearIntervalAsync(intervalId);
        debug('Interval cleared');
    }
    catch {
    }
});
