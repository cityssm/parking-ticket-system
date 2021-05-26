import type { RequestHandler } from "express";

import getUserProperties from "../../helpers/usersDB/getUserProperties.js";


export const handler: RequestHandler = (req, res) => {

  const userProperties = getUserProperties(req.body.userName);

  return res.json(userProperties);
};


export default handler;
