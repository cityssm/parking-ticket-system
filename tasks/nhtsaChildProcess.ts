import * as parkingDB from "../helpers/parkingDB.js";
import * as vehicleFunctions from "../helpers/functions.vehicle.js";

import * as configFunctions from "../helpers/functions.config.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import debug from "debug";
const debugTask = debug("parking-ticket-system:task:nhtsaChildProcess");

const initDate = new Date();
initDate.setMonth(initDate.getMonth() - 1);

let cutoffDate = dateTimeFns.dateToInteger(initDate);


let vehicleNCICs = [];


const processNCIC = async (index: number) => {

  const ncicRecord = vehicleNCICs[index];

  if (ncicRecord) {

    cutoffDate = ncicRecord.recordDateMax;

    const vehicleMake = vehicleFunctions.getMakeFromNCIC(ncicRecord.vehicleNCIC);

    debugTask("Processing " + vehicleMake);

    await vehicleFunctions.getModelsByMake(vehicleMake);

    processNCIC(index + 1);

  } else {
    vehicleNCICs = [];
    scheduleRun();
  }
};


export const scheduleRun = async (): Promise<void> => {

  const nextScheduleDate = new Date();

  nextScheduleDate.setHours(configFunctions.getProperty("application.task_nhtsa.executeHour"));
  nextScheduleDate.setDate(nextScheduleDate.getDate() + 1);

  debugTask("NHTSA task scheduled for " + nextScheduleDate.toString());

  setTimeout(async() => {

    debugTask("NHTSA task starting");

    vehicleNCICs = parkingDB.getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate);
    await processNCIC(0);

  }, nextScheduleDate.getTime() - Date.now());

};


scheduleRun();
