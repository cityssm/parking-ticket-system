"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const parkingDB = require("../helpers/parkingDB");
const vehicleFns = require("../helpers/vehicleFns");
const configFns = require("../helpers/configFns");
const dateTimeFns = require("../helpers/dateTimeFns");
let initDate = new Date();
initDate.setMonth(initDate.getMonth() - 1);
let cutoffDate = dateTimeFns.dateToInteger(initDate);
let vehicleNCICs = [];
function processNCIC(index) {
    const ncicRecord = vehicleNCICs[index];
    if (ncicRecord) {
        cutoffDate = ncicRecord.recordDateMax;
        const vehicleMake = vehicleFns.getMakeFromNCIC(ncicRecord.vehicleNCIC);
        console.log("Processing " + vehicleMake);
        vehicleFns.getModelsByMake(vehicleMake, function () {
            processNCIC(index + 1);
        });
    }
    else {
        vehicleNCICs = [];
        scheduleRun();
    }
}
;
function scheduleRun() {
    return __awaiter(this, void 0, void 0, function* () {
        let nextScheduleDate = new Date();
        nextScheduleDate.setHours(configFns.getProperty("application.task_nhtsa.executeHour"));
        nextScheduleDate.setDate(nextScheduleDate.getDate() + 1);
        console.log("NHTSA task scheduled for " + nextScheduleDate.toString());
        setTimeout(function () {
            console.log("NHTSA task starting");
            vehicleNCICs = parkingDB.getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate);
            processNCIC(0);
        }, nextScheduleDate.getTime() - Date.now());
    });
}
exports.scheduleRun = scheduleRun;