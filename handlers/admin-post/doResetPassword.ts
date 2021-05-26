import type { RequestHandler } from "express";

import generateNewPassword from "../../helpers/usersDB/generateNewPassword.js";


export const handler: RequestHandler = (req, res) => {

  const newPassword = generateNewPassword(req.body.userName);

  return res.json({
    success: true,
    newPassword
  });
};


export default handler;
