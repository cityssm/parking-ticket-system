import type { RequestHandler } from "express";

import * as mtoFns from "../../helpers/mtoFns";

import { userCanUpdate, userIsOperator, forbiddenJSON } from "../../helpers/userFns";

import * as multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });


export const uploadHandler = upload.single("importFile");


export const handler: RequestHandler = (req, res) => {

  if (!(userCanUpdate(req) || userIsOperator(req))) {
    return forbiddenJSON(res);
  }

  const batchID = req.body.batchID;

  const ownershipData = req.file.buffer.toString();

  const results = mtoFns.importLicencePlateOwnership(batchID, ownershipData, req.session);

  return res.json(results);
};
