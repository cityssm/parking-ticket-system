import { Router } from "express";

import * as configFns from "../helpers/configFns.js";
import * as usersDB_getUser from "../helpers/usersDB/getUser.js";

export const router = Router();


const getSafeRedirectURL = (possibleRedirectURL: string = "") => {

  switch (possibleRedirectURL) {
    case "/tickets":
    case "/tickets/new":
    case "/tickets/reconcile":
    case "/tickets-ontario/convict":
    case "/plates":
    case "/plates-ontario/mtoExport":
    case "/plates-ontario/mtoImport":
    case "/reports":
    case "/admin/userManagement":
    case "/admin/cleanup":
    case "/admin/offences":
    case "/admin/locations":
    case "/admin/bylaws":

      return possibleRedirectURL;
  }

  return "/dashboard";
};


router.route("/")
  .get((req, res) => {

    const sessionCookieName = configFns.getProperty("session.cookieName");

    if (req.session.user && req.cookies[sessionCookieName]) {

      const redirectURL = getSafeRedirectURL((req.query.redirect || "") as string);

      res.redirect(redirectURL);

    } else {

      res.render("login", {
        userName: "",
        message: "",
        redirect: req.query.redirect
      });

    }

  })
  .post((req, res) => {

    const userName = req.body.userName;
    const passwordPlain = req.body.password;

    const redirectURL = getSafeRedirectURL(req.body.redirect);

    const userObj = usersDB_getUser.getUser(userName, passwordPlain);

    if (userObj) {

      req.session.user = userObj;

      res.redirect(req.body.redirect);

    } else {

      res.render("login", {
        userName,
        message: "Login Failed",
        redirect: redirectURL
      });
    }
  });


export default router;
