import * as parkingDB from "../helpers/parkingDB.js";
import * as vehicleFns from "../helpers/vehicleFns.js";
import * as configFns from "../helpers/configFns.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import debug from "debug";
const debugTask = debug("parking-ticket-system:task:nhtsaChildProcess");
const initDate = new Date();
initDate.setMonth(initDate.getMonth() - 1);
let cutoffDate = dateTimeFns.dateToInteger(initDate);
let vehicleNCICs = [];
const processNCIC = (index) => {
    const ncicRecord = vehicleNCICs[index];
    if (ncicRecord) {
        cutoffDate = ncicRecord.recordDateMax;
        const vehicleMake = vehicleFns.getMakeFromNCIC(ncicRecord.vehicleNCIC);
        debugTask("Processing " + vehicleMake);
        vehicleFns.getModelsByMake(vehicleMake, () => {
            processNCIC(index + 1);
        });
    }
    else {
        vehicleNCICs = [];
        scheduleRun();
    }
};
export const scheduleRun = () => {
    const nextScheduleDate = new Date();
    nextScheduleDate.setHours(configFns.getProperty("application.task_nhtsa.executeHour"));
    nextScheduleDate.setDate(nextScheduleDate.getDate() + 1);
    debugTask("NHTSA task scheduled for " + nextScheduleDate.toString());
    setTimeout(() => {
        debugTask("NHTSA task starting");
        vehicleNCICs = parkingDB.getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate);
        processNCIC(0);
    }, nextScheduleDate.getTime() - Date.now());
};
scheduleRun();
