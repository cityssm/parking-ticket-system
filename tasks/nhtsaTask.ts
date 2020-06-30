import * as log from "fancy-log";

import * as parkingDB from "../helpers/parkingDB";
import * as vehicleFns from "../helpers/vehicleFns";

import * as configFns from "../helpers/configFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

const initDate = new Date();
initDate.setMonth(initDate.getMonth() - 1);

let cutoffDate = dateTimeFns.dateToInteger(initDate);


let vehicleNCICs = [];


const processNCIC = (index: number) => {

  const ncicRecord = vehicleNCICs[index];

  if (ncicRecord) {

    cutoffDate = ncicRecord.recordDateMax;

    const vehicleMake = vehicleFns.getMakeFromNCIC(ncicRecord.vehicleNCIC);

    log("Processing " + vehicleMake);

    vehicleFns.getModelsByMake(vehicleMake, () => {
      processNCIC(index + 1);
    });

  } else {
    vehicleNCICs = [];
    scheduleRun();
  }
};


export const scheduleRun = () => {

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
