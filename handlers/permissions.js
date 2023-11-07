import * as userFunctions from '../helpers/functions.user.js';
const dashboardRedirectUrl = '/dashboard';
export const adminGetHandler = (request, response, next) => {
    if (userFunctions.userIsAdmin(request)) {
        next();
        return;
    }
    response.redirect(dashboardRedirectUrl);
};
export const adminPostHandler = (request, response, next) => {
    if (userFunctions.userIsAdmin(request)) {
        next();
        return;
    }
    response.json(userFunctions.forbiddenJSON);
};
export const updateGetHandler = (request, response, next) => {
    if (userFunctions.userCanUpdate(request)) {
        next();
        return;
    }
    response.redirect(dashboardRedirectUrl);
};
export const updateOrOperatorGetHandler = (request, response, next) => {
    if (userFunctions.userCanUpdate(request) ||
        userFunctions.userIsOperator(request)) {
        next();
        return;
    }
    response.redirect(dashboardRedirectUrl);
};
export const updatePostHandler = (request, response, next) => {
    if (userFunctions.userCanUpdate(request)) {
        next();
        return;
    }
    response.json(userFunctions.forbiddenJSON);
};
export const updateOrOperatorPostHandler = (request, response, next) => {
    if (userFunctions.userCanUpdate(request) ||
        userFunctions.userIsOperator(request)) {
        next();
        return;
    }
    response.json(userFunctions.forbiddenJSON);
};
