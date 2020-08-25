"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostHandler = exports.createGetHandler = exports.updatePostHandler = exports.updateGetHandler = exports.adminPostHandler = exports.adminGetHandler = void 0;
const userFns = require("../helpers/userFns");
exports.adminGetHandler = (req, res, next) => {
    if (userFns.userIsAdmin(req)) {
        return next();
    }
    return res.redirect("/dashboard");
};
exports.adminPostHandler = (req, res, next) => {
    if (userFns.userIsAdmin(req)) {
        return next();
    }
    return res.json(userFns.forbiddenJSON);
};
exports.updateGetHandler = (req, res, next) => {
    if (userFns.userCanUpdate(req)) {
        return next();
    }
    return res.redirect("/dashboard");
};
exports.updatePostHandler = (req, res, next) => {
    if (userFns.userCanUpdate(req)) {
        return next();
    }
    return res.json(userFns.forbiddenJSON);
};
exports.createGetHandler = (req, res, next) => {
    if (userFns.userCanCreate(req)) {
        return next();
    }
    return res.redirect("/dashboard");
};
exports.createPostHandler = (req, res, next) => {
    if (userFns.userCanCreate(req)) {
        return next();
    }
    return res.json(userFns.forbiddenJSON);
};
