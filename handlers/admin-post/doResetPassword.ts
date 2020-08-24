import type { RequestHandler } from "express";

import * as usersDB_generateNewPassword from "../../helpers/usersDB/generateNewPassword";

import { userIsAdmin, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
  }

  const newPassword = usersDB_generateNewPassword.generateNewPassword(req.body.userName);

  return res.json({
    success: true,
    newPassword
  });
};
