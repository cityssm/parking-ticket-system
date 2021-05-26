import type { RequestHandler } from "express";

import usersDB_getAllUsers from "../../helpers/usersDB/getAllUsers.js";


export const handler: RequestHandler = (_req, res) => {

  const users = usersDB_getAllUsers();

  return res.render("admin-userManagement", {
    headTitle: "User Management",
    users
  });
};


export default handler;
