import type { RequestHandler } from "express";

import * as usersDB_getUserProperties from "../../helpers/usersDB/getUserProperties";


export const handler: RequestHandler = (req, res) => {

  const userProperties = usersDB_getUserProperties.getUserProperties(req.body.userName);

  return res.json(userProperties);
};
