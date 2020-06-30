import { Router } from "express";

import * as configFns from "../helpers/configFns";

import * as usersDB from "../helpers/usersDB";

const router = Router();


router.route("/")
  .get((req, res) => {

    const sessionCookieName = configFns.getProperty("session.cookieName");

    if (req.session.user && req.cookies[sessionCookieName]) {

      if (req.query.redirect && req.query.redirect !== "") {

        res.redirect(req.query.redirect);

      } else {

        res.redirect("/dashboard");

      }

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

    const redirectURL = req.body.redirect;

    const userObj = usersDB.getUser(userName, passwordPlain);

    if (userObj) {

      req.session.user = userObj;

      if (redirectURL && redirectURL !== "") {

        res.redirect(req.body.redirect);

      } else {

        res.redirect("/dashboard");

      }

    } else {

      res.render("login", {
        userName,
        message: "Login Failed",
        redirect: redirectURL
      });

    }

  });


export = router;
