import type { RequestHandler } from "express";

import * as usersDB_getUserProperties from "../../helpers/usersDB/getUserProperties";

import { userIsAdmin, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
  }

  const userProperties = usersDB_getUserProperties.getUserProperties(req.body.userName);

  return res.json(userProperties);
};
