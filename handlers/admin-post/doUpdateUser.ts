import type { RequestHandler } from "express";

import * as usersDB_updateUser from "../../helpers/usersDB/updateUser";


export const handler: RequestHandler = (req, res) => {

  const changeCount = usersDB_updateUser.updateUser(req.body);

  res.json({
    success: (changeCount === 1)
  });
};
