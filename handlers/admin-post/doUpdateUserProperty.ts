import type { RequestHandler } from "express";

import * as usersDB_updateUserProperty from "../../helpers/usersDB/updateUserProperty";


export const handler: RequestHandler = (req, res) => {

  const changeCount = usersDB_updateUserProperty.updateUserProperty(req.body);

  res.json({
    success: (changeCount === 1)
  });
};
