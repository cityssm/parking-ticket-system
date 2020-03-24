/* eslint-env node */

"use strict";

import createError = require("http-errors");
import express = require("express");
import https = require("https");
import fs = require("fs");
import compression = require("compression");
import path = require("path");
import cookieParser = require("cookie-parser");
import logger = require("morgan");

import { Config_HttpsConfig } from "./helpers/ptsTypes";


import session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);


const buildNumber = require("./buildNumber.json");


import routerDocs = require("./routes/docs");
import routerLogin = require("./routes/login");
import routerDashboard = require("./routes/dashboard");
import routerAdmin = require("./routes/admin");
import routerTickets = require("./routes/tickets");
import routerOffences = require("./routes/offences");
import routerPlates = require("./routes/plates");
import routerReports = require("./routes/reports");


import * as configFns from "./helpers/configFns";
import * as stringFns from "./helpers/stringFns";
import * as vehicleFns from "./helpers/vehicleFns";


/*
 * INITALIZE THE DATABASES
 */


import * as dbInit from "./helpers/dbInit";
dbInit.initUsersDB();
dbInit.initParkingDB();
dbInit.initNHTSADB();


/*
 * INITIALIZE APP
 */


const app = express();


// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


app.use(compression());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());


/*
 * STATIC ROUTES
 */


app.use(express.static(path.join(__dirname, "public")));
app.use("/fa", express.static(path.join(__dirname, "node_modules", "@fortawesome", "fontawesome-free")));
app.use("/typeface-pt-mono", express.static(path.join(__dirname, "node_modules", "typeface-pt-mono", "files")));


/*
 * SESSION MANAGEMENT
 */


const sessionCookieName: string = configFns.getProperty("session.cookieName");


// Initialize session
app.use(session({
  store: new SQLiteStore({
    dir: "data",
    db: "sessions.db"
  }),
  name: sessionCookieName,
  secret: configFns.getProperty("session.secret"),
  resave: true,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: configFns.getProperty("session.maxAgeMillis")
  }
}));

// Clear cookie if no corresponding session
app.use(function(req, res, next) {

  if (req.cookies[sessionCookieName] && !req.session.user) {

    res.clearCookie(sessionCookieName);

  }

  next();

});

// Redirect logged in users
const sessionChecker = function(req: express.Request, res: express.Response, next: express.NextFunction) {

  if (req.session.user && req.cookies[sessionCookieName]) {

    return next();

  }

  return res.redirect("/login?redirect=" + req.originalUrl);

};

// Redirect non-admin users
const adminChecker = function(req: express.Request, res: express.Response, next: express.NextFunction) {

  if (req.session.user.userProperties.isAdmin) {

    return next();

  }

  return res.redirect("/login?redirect=" + req.originalUrl);

};


/*
 * ROUTES
 */


// Make the user and config objects available to the templates
app.use(function(req, res, next) {

  res.locals.buildNumber = buildNumber;
  res.locals.user = req.session.user;
  res.locals.configFns = configFns;
  res.locals.stringFns = stringFns;
  res.locals.vehicleFns = vehicleFns;

  next();

});


app.get("/", sessionChecker, function(_req, res) {
  res.redirect("/dashboard");
});

app.use("/docs", routerDocs);

app.use("/dashboard", sessionChecker, routerDashboard);
app.use("/tickets", sessionChecker, routerTickets);
app.use("/plates", sessionChecker, routerPlates);
app.use("/reports", sessionChecker, routerReports);

app.use("/offences", sessionChecker, adminChecker, routerOffences);
app.use("/admin", sessionChecker, adminChecker, routerAdmin);

app.use("/login", routerLogin);

app.get("/logout", function(req, res) {

  if (req.session.user && req.cookies[sessionCookieName]) {

    req.session.destroy(null);
    req.session = null;
    res.clearCookie(sessionCookieName);
    res.redirect("/");

  } else {

    res.redirect("/login");

  }

});


// Catch 404 and forward to error handler
app.use(function(_req, _res, next) {

  next(createError(404));

});

// Error handler
app.use(function(err, req: express.Request, res: express.Response, _next: express.NextFunction) {

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");

});


/*
 * Open ports
 */


const httpPort = configFns.getProperty("application.httpPort");

if (httpPort) {

  app.listen(httpPort, function() {

    // eslint-disable-next-line no-console
    console.log("HTTP listening on port " + httpPort);

    if (configFns.getProperty("application.task_nhtsa.runTask")) {
      require("./tasks/nhtsaTask").scheduleRun();
    }

  });

}

const httpsConfig = <Config_HttpsConfig>configFns.getProperty("application.https");

if (httpsConfig) {

  https.createServer({
    key: fs.readFileSync(httpsConfig.keyPath),
    cert: fs.readFileSync(httpsConfig.certPath),
    passphrase: httpsConfig.passphrase
  }, app)
    .listen(httpsConfig.port);

  // eslint-disable-next-line no-console
  console.log("HTTPS listening on port " + httpsConfig.port);

}


/*
 * Initialize workers
 */



export = app;
