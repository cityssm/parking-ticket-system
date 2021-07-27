import type { RequestHandler } from "express";

import * as userFunctions from "../helpers/functions.user.js";


export const adminGetHandler: RequestHandler = (req, res, next) => {

  if (userFunctions.userIsAdmin(req)) {
    return next();
  }

  return res.redirect("/dashboard");
};


export const adminPostHandler: RequestHandler = (req, res, next) => {

  if (userFunctions.userIsAdmin(req)) {
    return next();
  }

  return res.json(userFunctions.forbiddenJSON);
};


export const updateGetHandler: RequestHandler = (req, res, next) => {

  if (userFunctions.userCanUpdate(req)) {
    return next();
  }

  return res.redirect("/dashboard");
};


export const updateOrOperatorGetHandler: RequestHandler = (req, res, next) => {

  if (userFunctions.userCanUpdate(req) || userFunctions.userIsOperator(req)) {
    return next();
  }

  return res.redirect("/dashboard");
};


export const updatePostHandler: RequestHandler = (req, res, next) => {

  if (userFunctions.userCanUpdate(req)) {
    return next();
  }

  return res.json(userFunctions.forbiddenJSON);
};


export const updateOrOperatorPostHandler: RequestHandler = (req, res, next) => {

  if (userFunctions.userCanUpdate(req) || userFunctions.userIsOperator(req)) {
    return next();
  }

  return res.json(userFunctions.forbiddenJSON);
};


export const createGetHandler: RequestHandler = (req, res, next) => {

  if (userFunctions.userCanCreate(req)) {
    return next();
  }

  return res.redirect("/dashboard");
};


export const createPostHandler: RequestHandler = (req, res, next) => {

  if (userFunctions.userCanCreate(req)) {
    return next();
  }

  return res.json(userFunctions.forbiddenJSON);
};
