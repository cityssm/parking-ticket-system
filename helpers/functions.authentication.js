import { ActiveDirectoryAuthenticator, PlainTextAuthenticator } from '@cityssm/authentication-helper';
import { useTestDatabases } from '../data/databasePaths.js';
import { getConfigProperty } from './functions.config.js';
const userDomain = getConfigProperty('application.userDomain');
const activeDirectoryConfig = getConfigProperty('activeDirectory');
const adAuthenticator = new ActiveDirectoryAuthenticator(activeDirectoryConfig);
let authenticator;
if (useTestDatabases) {
    const testingUsersList = getConfigProperty('users.testing');
    const testingUsers = {};
    for (const user of testingUsersList) {
        testingUsers[`${userDomain}\\${user}`] = user;
    }
    authenticator = new PlainTextAuthenticator(testingUsers, adAuthenticator);
}
else {
    authenticator = adAuthenticator;
}
export async function authenticate(userName, password) {
    return await authenticator.authenticate(userName, password);
}
const safeRedirects = new Set([
    '/tickets',
    '/tickets/new',
    '/tickets/reconcile',
    '/tickets-ontario/convict',
    '/plates',
    '/plates-ontario/mtoExport',
    '/plates-ontario/mtoImport',
    '/reports',
    '/admin/cleanup',
    '/admin/offences',
    '/admin/locations',
    '/admin/bylaws'
]);
export function getSafeRedirectURL(possibleRedirectURL = '') {
    const urlPrefix = getConfigProperty('reverseProxy.urlPrefix');
    if (typeof possibleRedirectURL === 'string') {
        const urlToCheck = possibleRedirectURL.startsWith(urlPrefix)
            ? possibleRedirectURL.slice(urlPrefix.length)
            : possibleRedirectURL;
        const urlToCheckLowerCase = urlToCheck.toLowerCase();
        if (safeRedirects.has(urlToCheckLowerCase)) {
            return urlPrefix + urlToCheck;
        }
    }
    return `${urlPrefix}/dashboard/`;
}
