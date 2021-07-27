import type { RequestHandler } from "express";

import { generateNewPassword } from "../../helpers/usersDB/generateNewPassword.js";


export const handler: RequestHandler = (request, response) => {

  const newPassword = generateNewPassword(request.body.userName);

  return response.json({
    success: true,
    newPassword
  });
};


export default handler;
