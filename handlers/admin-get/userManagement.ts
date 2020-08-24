import type { RequestHandler } from "express";

import * as usersDB_getAllUsers from "../../helpers/usersDB/getAllUsers";

import { userIsAdmin } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userIsAdmin(req)) {
    return res.redirect("/dashboard/?error=accessDenied");
  }

  const users = usersDB_getAllUsers.getAllUsers();

  return res.render("admin-userManagement", {
    headTitle: "User Management",
    users
  });
};
