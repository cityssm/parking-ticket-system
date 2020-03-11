import * as parkingDB from "../helpers/parkingDB";
import * as vehicleFns from "../helpers/vehicleFns";

import * as configFns from "../helpers/configFns";
import * as dateTimeFns from "../helpers/dateTimeFns";

let initDate = new Date();
initDate.setMonth(initDate.getMonth() - 1);

let cutoffDate = dateTimeFns.dateToInteger(initDate);


let vehicleNCICs = [];


function processNCIC(index: number) {

  const ncicRecord = vehicleNCICs[index];

  if (ncicRecord) {

    cutoffDate = ncicRecord.recordDateMax;

    const vehicleMake = vehicleFns.getMakeFromNCIC(ncicRecord.vehicleNCIC);

    console.log("Processing " + vehicleMake);

    vehicleFns.getModelsByMake(vehicleMake, function() {
      processNCIC(index + 1);
    });
  }
  else {
    vehicleNCICs = [];
    scheduleRun();
  }
};


export async function scheduleRun() {

  let nextScheduleDate = new Date();

  nextScheduleDate.setHours(configFns.getProperty("application.task_nhtsa.executeHour"));
  nextScheduleDate.setDate(nextScheduleDate.getDate() + 1);

  console.log("NHTSA task scheduled for " + nextScheduleDate.toString());

  setTimeout(function() {

    console.log("NHTSA task starting");

    vehicleNCICs = parkingDB.getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate);
    processNCIC(0);

  }, nextScheduleDate.getTime() - Date.now());


}
