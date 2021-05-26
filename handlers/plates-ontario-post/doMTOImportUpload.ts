import type { RequestHandler } from "express";

import * as mtoFns from "../../helpers/mtoFns.js";

import * as multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });


export const uploadHandler = upload.single("importFile");


export const handler: RequestHandler = (req, res) => {

  const batchID = req.body.batchID;

  const ownershipData = req.file.buffer.toString();

  const results = mtoFns.importLicencePlateOwnership(batchID, ownershipData, req.session);

  return res.json(results);
};


export default handler;
