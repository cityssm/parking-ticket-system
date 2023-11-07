import Debug from 'debug';
import { Router } from 'express';
import { useTestDatabases } from '../data/databasePaths.js';
import * as authenticationFunctions from '../helpers/functions.authentication.js';
import { getConfigProperty } from '../helpers/functions.config.js';
const debug = Debug('parking-ticket-system:login');
export const router = Router();
function getSafeRedirectURL(possibleRedirectURL = '') {
    switch (possibleRedirectURL) {
        case '/tickets':
        case '/tickets/new':
        case '/tickets/reconcile':
        case '/tickets-ontario/convict':
        case '/plates':
        case '/plates-ontario/mtoExport':
        case '/plates-ontario/mtoImport':
        case '/reports':
        case '/admin/cleanup':
        case '/admin/offences':
        case '/admin/locations':
        case '/admin/bylaws': {
            return possibleRedirectURL;
        }
    }
    return '/dashboard';
}
async function postHandler(request, response) {
    const userName = request.body.userName;
    const passwordPlain = request.body.password;
    const redirectURL = getSafeRedirectURL(request.body.redirect);
    let isAuthenticated = false;
    if (userName.startsWith('*')) {
        if (useTestDatabases && userName === passwordPlain) {
            isAuthenticated = getConfigProperty('users.testing').includes(userName);
            if (isAuthenticated) {
                debug(`Authenticated testing user: ${userName}`);
            }
        }
    }
    else {
        isAuthenticated = await authenticationFunctions.authenticate(userName, passwordPlain);
    }
    let userObject;
    if (isAuthenticated) {
        const userNameLowerCase = userName.toLowerCase();
        const canLogin = getConfigProperty('users.canLogin').some((currentUserName) => {
            return userNameLowerCase === currentUserName.toLowerCase();
        });
        if (canLogin) {
            const canUpdate = getConfigProperty('users.canUpdate').some((currentUserName) => {
                return userNameLowerCase === currentUserName.toLowerCase();
            });
            const isAdmin = getConfigProperty('users.isAdmin').some((currentUserName) => {
                return userNameLowerCase === currentUserName.toLowerCase();
            });
            const isOperator = getConfigProperty('users.isOperator').some((currentUserName) => {
                return userNameLowerCase === currentUserName.toLowerCase();
            });
            userObject = {
                userName: userNameLowerCase,
                canUpdate,
                isAdmin,
                isOperator
            };
        }
    }
    if (isAuthenticated && userObject !== undefined) {
        request.session.user = userObject;
        response.redirect(redirectURL);
    }
    else {
        response.render('login', {
            userName,
            message: 'Login Failed',
            redirect: redirectURL,
            useTestDatabases
        });
    }
}
router
    .route('/')
    .get((request, response) => {
    const sessionCookieName = getConfigProperty('session.cookieName');
    if (request.session.user && request.cookies[sessionCookieName]) {
        const redirectURL = getSafeRedirectURL((request.query.redirect ?? ''));
        response.redirect(redirectURL);
    }
    else {
        response.render('login', {
            userName: '',
            message: '',
            redirect: request.query.redirect,
            useTestDatabases
        });
    }
})
    .post(postHandler);
export default router;
