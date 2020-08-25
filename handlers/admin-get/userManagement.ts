import type { RequestHandler } from "express";

import * as usersDB_getAllUsers from "../../helpers/usersDB/getAllUsers";


export const handler: RequestHandler = (_req, res) => {

  const users = usersDB_getAllUsers.getAllUsers();

  return res.render("admin-userManagement", {
    headTitle: "User Management",
    users
  });
};
