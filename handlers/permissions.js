import * as userFunctions from "../helpers/functions.user.js";
export const adminGetHandler = (req, res, next) => {
    if (userFunctions.userIsAdmin(req)) {
        return next();
    }
    return res.redirect("/dashboard");
};
export const adminPostHandler = (req, res, next) => {
    if (userFunctions.userIsAdmin(req)) {
        return next();
    }
    return res.json(userFunctions.forbiddenJSON);
};
export const updateGetHandler = (req, res, next) => {
    if (userFunctions.userCanUpdate(req)) {
        return next();
    }
    return res.redirect("/dashboard");
};
export const updateOrOperatorGetHandler = (req, res, next) => {
    if (userFunctions.userCanUpdate(req) || userFunctions.userIsOperator(req)) {
        return next();
    }
    return res.redirect("/dashboard");
};
export const updatePostHandler = (req, res, next) => {
    if (userFunctions.userCanUpdate(req)) {
        return next();
    }
    return res.json(userFunctions.forbiddenJSON);
};
export const updateOrOperatorPostHandler = (req, res, next) => {
    if (userFunctions.userCanUpdate(req) || userFunctions.userIsOperator(req)) {
        return next();
    }
    return res.json(userFunctions.forbiddenJSON);
};
export const createGetHandler = (req, res, next) => {
    if (userFunctions.userCanCreate(req)) {
        return next();
    }
    return res.redirect("/dashboard");
};
export const createPostHandler = (req, res, next) => {
    if (userFunctions.userCanCreate(req)) {
        return next();
    }
    return res.json(userFunctions.forbiddenJSON);
};
