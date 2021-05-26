import createError from "http-errors";
import express from "express";
import compression from "compression";
import path from "path";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import rateLimit from "express-rate-limit";
import session from "express-session";
import sqlite from "connect-sqlite3";
import routerDocs from "./routes/docs.js";
import routerLogin from "./routes/login.js";
import routerDashboard from "./routes/dashboard.js";
import routerAdmin from "./routes/admin.js";
import routerTickets from "./routes/tickets.js";
import routerOffences from "./routes/offences.js";
import routerPlates from "./routes/plates.js";
import routerReports from "./routes/reports.js";
import routePlatesOntario from "./routes/plates-ontario.js";
import routeTicketsOntario from "./routes/tickets-ontario.js";
import * as configFns from "./helpers/configFns.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as stringFns from "@cityssm/expressjs-server-js/stringFns.js";
import * as htmlFns from "@cityssm/expressjs-server-js/htmlFns.js";
import * as vehicleFns from "./helpers/vehicleFns.js";
import * as usersDB_init from "./helpers/usersDB/initializeDatabase.js";
import * as parkingDB_init from "./helpers/parkingDB/initializeDatabase.js";
import * as dbInit from "./helpers/dbInit.js";
import debug from "debug";
const debugApp = debug("parking-ticket-system:app");
usersDB_init.initializeDatabase();
parkingDB_init.initializeDatabase();
dbInit.initNHTSADB();
export const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(compression());
app.use((req, _res, next) => {
    debugApp(`${req.method} ${req.url}`);
    next();
});
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(csurf({ cookie: true }));
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 500
});
app.use(limiter);
app.use(express.static(path.join(__dirname, "public")));
app.use("/docs/images", express.static(path.join(__dirname, "docs", "images")));
app.use("/fa", express.static(path.join(__dirname, "node_modules", "@fortawesome", "fontawesome-free")));
app.use("/fontsource-inter", express.static(path.join(__dirname, "node_modules", "@fontsource", "inter", "files")));
app.use("/fontsource-pt-mono", express.static(path.join(__dirname, "node_modules", "@fontsource", "pt-mono", "files")));
app.use("/cityssm-bulma-webapp-js", express.static(path.join(__dirname, "node_modules", "@cityssm", "bulma-webapp-js")));
const SQLiteStore = sqlite(session);
const sessionCookieName = configFns.getProperty("session.cookieName");
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
        maxAge: configFns.getProperty("session.maxAgeMillis"),
        sameSite: "strict"
    }
}));
app.use((req, res, next) => {
    if (req.cookies[sessionCookieName] && !req.session.user) {
        res.clearCookie(sessionCookieName);
    }
    next();
});
const sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies[sessionCookieName]) {
        return next();
    }
    return res.redirect("/login?redirect=" + req.originalUrl);
};
app.use((req, res, next) => {
    res.locals.buildNumber = process.env.npm_package_version;
    res.locals.user = req.session.user;
    res.locals.csrfToken = req.csrfToken();
    res.locals.configFns = configFns;
    res.locals.dateTimeFns = dateTimeFns;
    res.locals.stringFns = stringFns;
    res.locals.htmlFns = htmlFns;
    res.locals.vehicleFns = vehicleFns;
    next();
});
app.get("/", sessionChecker, (_req, res) => {
    res.redirect("/dashboard");
});
app.use("/docs", routerDocs);
app.use("/dashboard", sessionChecker, routerDashboard);
app.use("/tickets", sessionChecker, routerTickets);
app.use("/plates", sessionChecker, routerPlates);
app.use("/offences", sessionChecker, routerOffences);
app.use("/reports", sessionChecker, routerReports);
if (configFns.getProperty("application.feature_mtoExportImport")) {
    app.use("/plates-ontario", sessionChecker, routePlatesOntario);
    app.use("/tickets-ontario", sessionChecker, routeTicketsOntario);
}
app.use("/admin", sessionChecker, routerAdmin);
app.all("/keepAlive", (_req, res) => {
    res.json(true);
});
app.use("/login", routerLogin);
app.get("/logout", (req, res) => {
    if (req.session.user && req.cookies[sessionCookieName]) {
        req.session.destroy(null);
        req.session = null;
        res.clearCookie(sessionCookieName);
        res.redirect("/");
    }
    else {
        res.redirect("/login");
    }
});
app.use((_req, _res, next) => {
    next(createError(404));
});
app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});
export default app;
