"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.uploadHandler = void 0;
const mtoFns = require("../../helpers/mtoFns");
const userFns_1 = require("../../helpers/userFns");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
exports.uploadHandler = upload.single("importFile");
exports.handler = (req, res) => {
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
        return userFns_1.forbiddenJSON(res);
    }
    const batchID = req.body.batchID;
    const ownershipData = req.file.buffer.toString();
    const results = mtoFns.importLicencePlateOwnership(batchID, ownershipData, req.session);
    return res.json(results);
};
