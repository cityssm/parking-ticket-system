import type { RequestHandler } from "express";

import inactivateUser from "../../helpers/usersDB/inactivateUser.js";

import { forbiddenJSON } from "../../helpers/functions.user.js";


export const handler: RequestHandler = (req, res) => {

  const userNameToDelete = req.body.userName;

  if (userNameToDelete === req.session.user.userName) {

    // You can't delete yourself!
    return forbiddenJSON(res);

  }

  const success = inactivateUser(userNameToDelete);

  return res.json({ success });
};


export default handler;
