import type { RequestHandler } from "express";

import { createUser } from "../../helpers/usersDB/createUser.js";


export const handler: RequestHandler = (request, response) => {

  const newPassword = createUser(request.body);

  if (!newPassword) {

    response.json({
      success: false,
      message: "New Account Not Created"
    });

  } else {

    response.json({
      success: true,
      newPassword
    });
  }
};


export default handler;
