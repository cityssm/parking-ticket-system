import { getConfigProperty } from '../helpers/functions.config.js';
import { forbiddenJSON, userCanUpdate, userIsAdmin, userIsOperator } from '../helpers/functions.user.js';
const dashboardRedirectUrl = `${getConfigProperty('reverseProxy.urlPrefix')}/dashboard`;
export const adminGetHandler = (request, response, next) => {
    if (userIsAdmin(request)) {
        next();
        return;
    }
    response.redirect(dashboardRedirectUrl);
};
export const adminPostHandler = (request, response, next) => {
    if (userIsAdmin(request)) {
        next();
        return;
    }
    response.json(forbiddenJSON(response));
};
export const updateGetHandler = (request, response, next) => {
    if (userCanUpdate(request)) {
        next();
        return;
    }
    response.redirect(dashboardRedirectUrl);
};
export const updateOrOperatorGetHandler = (request, response, next) => {
    if (userCanUpdate(request) || userIsOperator(request)) {
        next();
        return;
    }
    response.redirect(dashboardRedirectUrl);
};
export const updatePostHandler = (request, response, next) => {
    if (userCanUpdate(request)) {
        next();
        return;
    }
    response.json(forbiddenJSON(response));
};
export const updateOrOperatorPostHandler = (request, response, next) => {
    if (userCanUpdate(request) || userIsOperator(request)) {
        next();
        return;
    }
    response.json(forbiddenJSON(response));
};
