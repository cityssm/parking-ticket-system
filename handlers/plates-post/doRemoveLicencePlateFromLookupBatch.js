"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_removeLicencePlateFromLookupBatch = require("../../helpers/parkingDB/removeLicencePlateFromLookupBatch");
exports.handler = (req, res) => {
    const result = parkingDB_removeLicencePlateFromLookupBatch.removeLicencePlateFromLookupBatch(req.body, req.session);
    return res.json(result);
};
