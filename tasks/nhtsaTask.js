"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleRun = void 0;
const log = require("fancy-log");
const parkingDB = require("../helpers/parkingDB");
const vehicleFns = require("../helpers/vehicleFns");
const configFns = require("../helpers/configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const initDate = new Date();
initDate.setMonth(initDate.getMonth() - 1);
let cutoffDate = dateTimeFns.dateToInteger(initDate);
let vehicleNCICs = [];
const processNCIC = (index) => {
    const ncicRecord = vehicleNCICs[index];
    if (ncicRecord) {
        cutoffDate = ncicRecord.recordDateMax;
        const vehicleMake = vehicleFns.getMakeFromNCIC(ncicRecord.vehicleNCIC);
        log("Processing " + vehicleMake);
        vehicleFns.getModelsByMake(vehicleMake, () => {
            processNCIC(index + 1);
        });
    }
    else {
        vehicleNCICs = [];
        exports.scheduleRun();
    }
};
exports.scheduleRun = () => {
    const nextScheduleDate = new Date();
    nextScheduleDate.setHours(configFns.getProperty("application.task_nhtsa.executeHour"));
    nextScheduleDate.setDate(nextScheduleDate.getDate() + 1);
    log.info("NHTSA task scheduled for " + nextScheduleDate.toString());
    setTimeout(() => {
        log("NHTSA task starting");
        vehicleNCICs = parkingDB.getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate);
        processNCIC(0);
    }, nextScheduleDate.getTime() - Date.now());
};
