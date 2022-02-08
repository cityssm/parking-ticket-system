import type { RequestHandler } from "express";

import * as userFunctions from "../helpers/functions.user.js";


export const adminGetHandler: RequestHandler = (request, response, next) => {

  if (userFunctions.userIsAdmin(request)) {
    return next();
  }

  return response.redirect("/dashboard");
};


export const adminPostHandler: RequestHandler = (request, response, next) => {

  if (userFunctions.userIsAdmin(request)) {
    return next();
  }

  return response.json(userFunctions.forbiddenJSON);
};


export const updateGetHandler: RequestHandler = (request, response, next) => {

  if (userFunctions.userCanUpdate(request)) {
    return next();
  }

  return response.redirect("/dashboard");
};


export const updateOrOperatorGetHandler: RequestHandler = (request, response, next) => {

  if (userFunctions.userCanUpdate(request) || userFunctions.userIsOperator(request)) {
    return next();
  }

  return response.redirect("/dashboard");
};


export const updatePostHandler: RequestHandler = (request, response, next) => {

  if (userFunctions.userCanUpdate(request)) {
    return next();
  }

  return response.json(userFunctions.forbiddenJSON);
};


export const updateOrOperatorPostHandler: RequestHandler = (request, response, next) => {

  if (userFunctions.userCanUpdate(request) || userFunctions.userIsOperator(request)) {
    return next();
  }

  return response.json(userFunctions.forbiddenJSON);
};
