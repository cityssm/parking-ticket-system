import type { RequestHandler } from "express";

import * as usersDB_updateUser from "../../helpers/usersDB/updateUser";

import { userIsAdmin, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
  }

  const changeCount = usersDB_updateUser.updateUser(req.body);

  res.json({
    success: (changeCount === 1)
  });
};
