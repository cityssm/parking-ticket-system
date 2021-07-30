import type { RequestHandler } from "express";

import { updateUser } from "../../helpers/usersDB/updateUser.js";


export const handler: RequestHandler = (request, response) => {

  const success = updateUser(request.body);

  response.json({
    success
  });
};


export default handler;
