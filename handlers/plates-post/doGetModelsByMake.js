"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const vehicleFns = require("../../helpers/vehicleFns");
exports.handler = (req, res) => {
    const makeModelList = vehicleFns.getModelsByMakeFromCache(req.body.vehicleMake);
    res.json(makeModelList);
};
