import * as userFns from "../helpers/userFns.js";
export const adminGetHandler = (req, res, next) => {
    if (userFns.userIsAdmin(req)) {
        return next();
    }
    return res.redirect("/dashboard");
};
export const adminPostHandler = (req, res, next) => {
    if (userFns.userIsAdmin(req)) {
        return next();
    }
    return res.json(userFns.forbiddenJSON);
};
export const updateGetHandler = (req, res, next) => {
    if (userFns.userCanUpdate(req)) {
        return next();
    }
    return res.redirect("/dashboard");
};
export const updateOrOperatorGetHandler = (req, res, next) => {
    if (userFns.userCanUpdate(req) || userFns.userIsOperator(req)) {
        return next();
    }
    return res.redirect("/dashboard");
};
export const updatePostHandler = (req, res, next) => {
    if (userFns.userCanUpdate(req)) {
        return next();
    }
    return res.json(userFns.forbiddenJSON);
};
export const updateOrOperatorPostHandler = (req, res, next) => {
    if (userFns.userCanUpdate(req) || userFns.userIsOperator(req)) {
        return next();
    }
    return res.json(userFns.forbiddenJSON);
};
export const createGetHandler = (req, res, next) => {
    if (userFns.userCanCreate(req)) {
        return next();
    }
    return res.redirect("/dashboard");
};
export const createPostHandler = (req, res, next) => {
    if (userFns.userCanCreate(req)) {
        return next();
    }
    return res.json(userFns.forbiddenJSON);
};
