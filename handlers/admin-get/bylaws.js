"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getParkingBylaws = require("../../helpers/parkingDB/getParkingBylaws");
exports.handler = (_req, res) => {
    const bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();
    return res.render("bylaw-maint", {
        headTitle: "By-Law Maintenance",
        bylaws
    });
};
