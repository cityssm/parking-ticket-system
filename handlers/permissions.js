import * as userFunctions from "../helpers/functions.user.js";
export const adminGetHandler = (request, response, next) => {
    if (userFunctions.userIsAdmin(request)) {
        return next();
    }
    return response.redirect("/dashboard");
};
export const adminPostHandler = (request, response, next) => {
    if (userFunctions.userIsAdmin(request)) {
        return next();
    }
    return response.json(userFunctions.forbiddenJSON);
};
export const updateGetHandler = (request, response, next) => {
    if (userFunctions.userCanUpdate(request)) {
        return next();
    }
    return response.redirect("/dashboard");
};
export const updateOrOperatorGetHandler = (request, response, next) => {
    if (userFunctions.userCanUpdate(request) || userFunctions.userIsOperator(request)) {
        return next();
    }
    return response.redirect("/dashboard");
};
export const updatePostHandler = (request, response, next) => {
    if (userFunctions.userCanUpdate(request)) {
        return next();
    }
    return response.json(userFunctions.forbiddenJSON);
};
export const updateOrOperatorPostHandler = (request, response, next) => {
    if (userFunctions.userCanUpdate(request) || userFunctions.userIsOperator(request)) {
        return next();
    }
    return response.json(userFunctions.forbiddenJSON);
};
