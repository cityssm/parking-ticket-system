import path from 'node:path';
import * as htmlFns from '@cityssm/expressjs-server-js/htmlFns.js';
import * as stringFns from '@cityssm/expressjs-server-js/stringFns.js';
import * as dateTimeFns from '@cityssm/utils-datetime';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import Debug from 'debug';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import createError from 'http-errors';
import FileStore from 'session-file-store';
import { useTestDatabases } from './data/databasePaths.js';
import * as configFunctions from './helpers/functions.config.js';
import { hasActiveSession, sessionHandler } from './helpers/functions.session.js';
import * as vehicleFunctions from './helpers/functions.vehicle.js';
import routerAdmin from './routes/admin.js';
import routerDashboard from './routes/dashboard.js';
import routerLogin from './routes/login.js';
import routerOffences from './routes/offences.js';
import routePlatesOntario from './routes/plates-ontario.js';
import routerPlates from './routes/plates.js';
import routerReports from './routes/reports.js';
import routeTicketsOntario from './routes/tickets-ontario.js';
import routerTickets from './routes/tickets.js';
import { version } from './version.js';
const debug = Debug(`parking-ticket-system:app:${process.pid}`);
export const app = express();
app.set('views', path.join('views'));
app.set('view engine', 'ejs');
app.use(compression());
app.use((request, _response, next) => {
    debug(`${request.method} ${request.url}`);
    next();
});
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(csurf({ cookie: true }));
if (!useTestDatabases) {
    const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 500
    });
    app.use(limiter);
}
const urlPrefix = configFunctions.getConfigProperty('reverseProxy.urlPrefix');
if (urlPrefix !== '') {
    debug(`urlPrefix = ${urlPrefix}`);
}
app.use(urlPrefix, express.static(path.join('public')));
app.use(`${urlPrefix}/fa`, express.static(path.join('node_modules', '@fortawesome', 'fontawesome-free')));
app.use(`${urlPrefix}/stylesheets/fontsource-pt-mono`, express.static(path.join('node_modules', '@fontsource', 'pt-mono', 'files')));
app.use(`${urlPrefix}/cityssm-bulma-webapp-js`, express.static(path.join('node_modules', '@cityssm', 'bulma-webapp-js')));
app.use(`${urlPrefix}/bulma-js`, express.static(path.join('node_modules', '@cityssm', 'bulma-js', 'dist')));
const sessionCookieName = configFunctions.getConfigProperty('session.cookieName');
const FileStoreSession = FileStore(session);
app.use(session({
    store: new FileStoreSession({
        path: './data/sessions',
        logFn: Debug('parking-ticket-system:session'),
        retries: 10
    }),
    name: sessionCookieName,
    secret: configFunctions.getConfigProperty('session.secret'),
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: configFunctions.getConfigProperty('session.maxAgeMillis'),
        sameSite: 'strict'
    }
}));
app.use((request, response, next) => {
    if (Object.hasOwn(request.cookies, sessionCookieName) &&
        !Object.hasOwn(request.session, 'user')) {
        response.clearCookie(sessionCookieName);
    }
    next();
});
app.use((request, response, next) => {
    response.locals.buildNumber = version;
    response.locals.user = request.session.user;
    response.locals.csrfToken = request.csrfToken();
    response.locals.configFunctions = configFunctions;
    response.locals.dateTimeFns = dateTimeFns;
    response.locals.stringFns = stringFns;
    response.locals.htmlFns = htmlFns;
    response.locals.vehicleFunctions = vehicleFunctions;
    response.locals.urlPrefix = configFunctions.getConfigProperty('reverseProxy.urlPrefix');
    next();
});
app.get(`${urlPrefix}/`, sessionHandler, (_request, response) => {
    response.redirect(`${urlPrefix}/dashboard`);
});
app.use(`${urlPrefix}/dashboard`, sessionHandler, routerDashboard);
app.use(`${urlPrefix}/tickets`, sessionHandler, routerTickets);
app.use(`${urlPrefix}/plates`, sessionHandler, routerPlates);
app.use(`${urlPrefix}/offences`, sessionHandler, routerOffences);
app.use(`${urlPrefix}/reports`, sessionHandler, routerReports);
if (configFunctions.getConfigProperty('application.feature_mtoExportImport')) {
    app.use(`${urlPrefix}/plates-ontario`, sessionHandler, routePlatesOntario);
    app.use(`${urlPrefix}/tickets-ontario`, sessionHandler, routeTicketsOntario);
}
app.use(`${urlPrefix}/admin`, sessionHandler, routerAdmin);
if (configFunctions.getConfigProperty('session.doKeepAlive')) {
    app.all(`${urlPrefix}/keepAlive`, (_request, response) => {
        response.json(true);
    });
}
app.use(`${urlPrefix}/login`, routerLogin);
app.get(`${urlPrefix}/logout`, (request, response) => {
    if (hasActiveSession(request)) {
        request.session.destroy(() => {
            response.clearCookie(sessionCookieName);
            response.redirect(`${urlPrefix}/`);
        });
    }
    else {
        response.redirect(`${urlPrefix}/login`);
    }
});
app.use((request, _response, next) => {
    next(createError(404, `File not found: ${request.url}`));
});
app.use((error, request, response) => {
    response.locals.message = error.message;
    response.locals.error =
        request.app.get('env') === 'development' ? error : {};
    response.status(error.status ?? 500);
    response.render('error');
});
export default app;
