"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.uploadHandler = void 0;
const mtoFns = require("../../helpers/mtoFns");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
exports.uploadHandler = upload.single("importFile");
exports.handler = (req, res) => {
    const batchID = req.body.batchID;
    const ownershipData = req.file.buffer.toString();
    const results = mtoFns.importLicencePlateOwnership(batchID, ownershipData, req.session);
    return res.json(results);
};
