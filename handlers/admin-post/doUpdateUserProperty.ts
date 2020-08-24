import type { RequestHandler } from "express";

import * as usersDB_updateUserProperty from "../../helpers/usersDB/updateUserProperty";

import { userIsAdmin, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
  }

  const changeCount = usersDB_updateUserProperty.updateUserProperty(req.body);

  res.json({
    success: (changeCount === 1)
  });
};
