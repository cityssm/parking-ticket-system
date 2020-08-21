"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParkingTicketRemark = exports.updateParkingTicketRemark = exports.createParkingTicketRemark = exports.getParkingTicketRemarks = void 0;
const parkingDB_getParkingTicketRemarks = require("./getParkingTicketRemarks");
const parkingDB_createParkingTicketRemark = require("./createParkingTicketRemark");
const parkingDB_updateParkingTicketRemark = require("./updateParkingTicketRemark");
const parkingDB_deleteParkingTicketRemark = require("./deleteParkingTicketRemark");
exports.getParkingTicketRemarks = parkingDB_getParkingTicketRemarks.getParkingTicketRemarks;
exports.createParkingTicketRemark = parkingDB_createParkingTicketRemark.createParkingTicketRemark;
exports.updateParkingTicketRemark = parkingDB_updateParkingTicketRemark.updateParkingTicketRemark;
exports.deleteParkingTicketRemark = parkingDB_deleteParkingTicketRemark.deleteParkingTicketRemark;
