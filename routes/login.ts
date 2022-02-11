import { Router } from "express";

import * as configFunctions from "../helpers/functions.config.js";

import * as authenticationFunctions from "../helpers/functions.authentication.js";

import { useTestDatabases } from "../data/databasePaths.js";

import Debug from "debug";
const debug = Debug("parking-ticket-system:login");

import type * as recordTypes from "../types/recordTypes";


export const router = Router();


const getSafeRedirectURL = (possibleRedirectURL = "") => {

  switch (possibleRedirectURL) {
    case "/tickets":
    case "/tickets/new":
    case "/tickets/reconcile":
    case "/tickets-ontario/convict":
    case "/plates":
    case "/plates-ontario/mtoExport":
    case "/plates-ontario/mtoImport":
    case "/reports":
    case "/admin/cleanup":
    case "/admin/offences":
    case "/admin/locations":
    case "/admin/bylaws":

      return possibleRedirectURL;
  }

  return "/dashboard";
};


router.route("/")
  .get((request, response) => {

    const sessionCookieName = configFunctions.getProperty("session.cookieName");

    if (request.session.user && request.cookies[sessionCookieName]) {

      const redirectURL = getSafeRedirectURL((request.query.redirect || "") as string);

      response.redirect(redirectURL);

    } else {

      response.render("login", {
        userName: "",
        message: "",
        redirect: request.query.redirect,
        useTestDatabases
      });

    }

  })
  .post(async (request, response) => {

    const userName = request.body.userName;
    const passwordPlain = request.body.password;

    const redirectURL = getSafeRedirectURL(request.body.redirect);

    let isAuthenticated = false;

    if (userName.charAt(0) === "*" && userName === passwordPlain) {

      isAuthenticated = configFunctions.getProperty("users.testing").includes(userName);

      if (isAuthenticated) {
        debug("Authenticated testing user: " + userName);
      }
    } else {

      isAuthenticated = await authenticationFunctions.authenticate(userName, passwordPlain);
    }

    let userObject: recordTypes.User;

    if (isAuthenticated) {

      const userNameLowerCase = userName.toLowerCase();

      const canLogin = configFunctions.getProperty("users.canLogin")
        .some((currentUserName) => {
          return userNameLowerCase === currentUserName.toLowerCase();
        });

      if (canLogin) {

        const canUpdate = configFunctions.getProperty("users.canUpdate")
          .some((currentUserName) => {
            return userNameLowerCase === currentUserName.toLowerCase();
          });

        const isAdmin = configFunctions.getProperty("users.isAdmin")
          .some((currentUserName) => {
            return userNameLowerCase === currentUserName.toLowerCase();
          });

        const isOperator = configFunctions.getProperty("users.isOperator")
          .some((currentUserName) => {
            return userNameLowerCase === currentUserName.toLowerCase();
          });

        userObject = {
          userName: userNameLowerCase,
          userProperties: {
            canUpdate,
            isAdmin,
            isOperator
          }
        };
      }
    }

    if (isAuthenticated && userObject) {

      request.session.user = userObject;

      response.redirect(redirectURL);

    } else {

      response.render("login", {
        userName,
        message: "Login Failed",
        redirect: redirectURL
      });
    }
  });


export default router;
