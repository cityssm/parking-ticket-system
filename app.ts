import createError from "http-errors";
import express from "express";

import compression from "compression";
import path from "path";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import rateLimit from "express-rate-limit";

import session from "express-session";
import sqlite from "connect-sqlite3";

// eslint-disable-next-line unicorn/prevent-abbreviations
import routerLogin from "./routes/login.js";
import routerDashboard from "./routes/dashboard.js";
import routerAdmin from "./routes/admin.js";
import routerTickets from "./routes/tickets.js";
import routerOffences from "./routes/offences.js";
import routerPlates from "./routes/plates.js";
import routerReports from "./routes/reports.js";

import routePlatesOntario from "./routes/plates-ontario.js";
import routeTicketsOntario from "./routes/tickets-ontario.js";

import * as configFunctions from "./helpers/functions.config.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as stringFns from "@cityssm/expressjs-server-js/stringFns.js";
import * as htmlFns from "@cityssm/expressjs-server-js/htmlFns.js";
import * as vehicleFunctions from "./helpers/functions.vehicle.js";

import * as parkingDB_init from "./helpers/parkingDB/initializeDatabase.js";
import { initNHTSADB } from "./helpers/initializeDatabase.js";

import debug from "debug";
const debugApp = debug("parking-ticket-system:app");


/*
 * INITALIZE THE DATABASES
 */

parkingDB_init.initializeDatabase();
initNHTSADB();


/*
 * INITIALIZE APP
 */


export const app = express();


// View engine setup
app.set("views", path.join("views"));
app.set("view engine", "ejs");


app.use(compression());

app.use((request, _response, next) => {
  debugApp(`${request.method} ${request.url}`);
  next();
});

app.use(express.json());

app.use(express.urlencoded({
  extended: false
}));

app.use(cookieParser());
app.use(csurf({ cookie: true }));


/*
 * Rate Limiter
 */

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500
});

app.use(limiter);


/*
 * STATIC ROUTES
 */


app.use(express.static(path.join("public")));

app.use("/fa",
  express.static(path.join("node_modules", "@fortawesome", "fontawesome-free")));

app.use("/stylesheets/files",
  express.static(path.join("node_modules", "@fontsource", "inter", "files")));

app.use("/fontsource-pt-mono",
  express.static(path.join("node_modules", "@fontsource", "pt-mono", "files")));

app.use("/cityssm-bulma-webapp-js",
  express.static(path.join("node_modules", "@cityssm", "bulma-webapp-js")));

app.use("/bulma-js",
  express.static(path.join("node_modules", "@cityssm", "bulma-js", "dist")));


/*
 * SESSION MANAGEMENT
 */

const SQLiteStore = sqlite(session);


const sessionCookieName: string = configFunctions.getProperty("session.cookieName");


// Initialize session
app.use(session({
  store: new SQLiteStore({
    dir: "data",
    db: "sessions.db"
  }),
  name: sessionCookieName,
  secret: configFunctions.getProperty("session.secret"),
  resave: true,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: configFunctions.getProperty("session.maxAgeMillis"),
    sameSite: "strict"
  }
}));

// Clear cookie if no corresponding session
app.use((request, response, next) => {

  if (request.cookies[sessionCookieName] && !request.session.user) {
    response.clearCookie(sessionCookieName);
  }

  next();
});

// Redirect logged in users
const sessionChecker = (request: express.Request, response: express.Response, next: express.NextFunction) => {

  if (request.session.user && request.cookies[sessionCookieName]) {
    return next();
  }

  return response.redirect("/login?redirect=" + request.originalUrl);
};


/*
 * ROUTES
 */


// Make the user and config objects available to the templates
app.use((request, response, next) => {

  response.locals.buildNumber = process.env.npm_package_version;

  response.locals.user = request.session.user;
  response.locals.csrfToken = request.csrfToken();

  response.locals.configFunctions = configFunctions;
  response.locals.dateTimeFns = dateTimeFns;
  response.locals.stringFns = stringFns;
  response.locals.htmlFns = htmlFns;
  response.locals.vehicleFunctions = vehicleFunctions;

  next();
});


app.get("/", sessionChecker, (_request, response) => {
  response.redirect("/dashboard");
});

app.use("/dashboard", sessionChecker, routerDashboard);
app.use("/tickets", sessionChecker, routerTickets);
app.use("/plates", sessionChecker, routerPlates);
app.use("/offences", sessionChecker, routerOffences);
app.use("/reports", sessionChecker, routerReports);

if (configFunctions.getProperty("application.feature_mtoExportImport")) {

  app.use("/plates-ontario", sessionChecker, routePlatesOntario);
  app.use("/tickets-ontario", sessionChecker, routeTicketsOntario);
}

app.use("/admin", sessionChecker, routerAdmin);

app.all("/keepAlive", (_request, response) => {
  response.json(true);
});

app.use("/login", routerLogin);

app.get("/logout", (request, response) => {

  if (request.session.user && request.cookies[sessionCookieName]) {

    request.session.destroy(() => {
      response.clearCookie(sessionCookieName);
      response.redirect("/");
    });

  } else {

    response.redirect("/login");
  }
});


// Catch 404 and forward to error handler
app.use((_request, _response, next) => {
  next(createError(404));
});

// Error handler
app.use((error: createError.HttpError, request: express.Request, response: express.Response) => {

  // Set locals, only providing error in development
  response.locals.message = error.message;
  response.locals.error = request.app.get("env") === "development" ? error : {};

  // Render the error page
  response.status(error.status || 500);
  response.render("error");
});


export default app;
