"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getLicencePlates = require("../../helpers/parkingDB/getLicencePlates");
exports.handler = (req, res) => {
    const queryOptions = {
        limit: parseInt(req.body.limit, 10),
        offset: parseInt(req.body.offset, 10),
        licencePlateNumber: req.body.licencePlateNumber
    };
    if (req.body.hasOwnerRecord !== "") {
        queryOptions.hasOwnerRecord = (req.body.hasOwnerRecord === "1");
    }
    if (req.body.hasUnresolvedTickets !== "") {
        queryOptions.hasUnresolvedTickets = (req.body.hasUnresolvedTickets === "1");
    }
    res.json(parkingDB_getLicencePlates.getLicencePlates(queryOptions));
};
