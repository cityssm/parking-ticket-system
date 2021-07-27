import type { RequestHandler } from "express";

import { inactivateUser } from "../../helpers/usersDB/inactivateUser.js";

import { forbiddenJSON } from "../../helpers/functions.user.js";


export const handler: RequestHandler = (request, response) => {

  const userNameToDelete = request.body.userName;

  if (userNameToDelete === request.session.user.userName) {

    // You can't delete yourself!
    return forbiddenJSON(response);

  }

  const success = inactivateUser(userNameToDelete);

  return response.json({ success });
};


export default handler;
