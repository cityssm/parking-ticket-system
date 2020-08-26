import type { RequestHandler } from "express";

import * as usersDB_inactivateUser from "../../helpers/usersDB/inactivateUser";

import { forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  const userNameToDelete = req.body.userName;

  if (userNameToDelete === req.session.user.userName) {

    // You can't delete yourself!
    return forbiddenJSON(res);

  }

  const success = usersDB_inactivateUser.inactivateUser(userNameToDelete);

  return res.json({ success });
};
