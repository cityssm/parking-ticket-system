"use strict";
const createError = require("http-errors");
const express = require("express");
const compression = require("compression");
const path = require("path");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");
const logger = require("morgan");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const sqlite = require("connect-sqlite3");
const package_json_1 = require("./package.json");
const routerDocs = require("./routes/docs");
const routerLogin = require("./routes/login");
const routerDashboard = require("./routes/dashboard");
const routerAdmin = require("./routes/admin");
const routerTickets = require("./routes/tickets");
const routerOffences = require("./routes/offences");
const routerPlates = require("./routes/plates");
const routerReports = require("./routes/reports");
const routePlatesOntario = require("./routes/plates-ontario");
const routeTicketsOntario = require("./routes/tickets-ontario");
const configFns = require("./helpers/configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const stringFns = require("@cityssm/expressjs-server-js/stringFns");
const htmlFns = require("@cityssm/expressjs-server-js/htmlFns");
const vehicleFns = require("./helpers/vehicleFns");
const usersDB_init = require("./helpers/usersDB/initializeDatabase");
const parkingDB_init = require("./helpers/parkingDB/initializeDatabase");
const dbInit = require("./helpers/dbInit");
usersDB_init.initializeDatabase();
parkingDB_init.initializeDatabase();
dbInit.initNHTSADB();
const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(compression());
app.use(logger("dev"));
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
    res.locals.buildNumber = package_json_1.version;
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
module.exports = app;
