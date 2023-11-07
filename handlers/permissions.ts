import type { RequestHandler } from 'express'

import * as userFunctions from '../helpers/functions.user.js'

const dashboardRedirectUrl = '/dashboard'

export const adminGetHandler: RequestHandler = (request, response, next) => {
  if (userFunctions.userIsAdmin(request)) {
    next()
    return
  }

  response.redirect(dashboardRedirectUrl)
}

export const adminPostHandler: RequestHandler = (request, response, next) => {
  if (userFunctions.userIsAdmin(request)) {
    next()
    return
  }

  response.json(userFunctions.forbiddenJSON)
}

export const updateGetHandler: RequestHandler = (request, response, next) => {
  if (userFunctions.userCanUpdate(request)) {
    next()
    return
  }

  response.redirect(dashboardRedirectUrl)
}

export const updateOrOperatorGetHandler: RequestHandler = (
  request,
  response,
  next
) => {
  if (
    userFunctions.userCanUpdate(request) ||
    userFunctions.userIsOperator(request)
  ) {
    next()
    return
  }

  response.redirect(dashboardRedirectUrl)
}

export const updatePostHandler: RequestHandler = (request, response, next) => {
  if (userFunctions.userCanUpdate(request)) {
    next()
    return
  }

  response.json(userFunctions.forbiddenJSON)
}

export const updateOrOperatorPostHandler: RequestHandler = (
  request,
  response,
  next
) => {
  if (
    userFunctions.userCanUpdate(request) ||
    userFunctions.userIsOperator(request)
  ) {
    next()
    return
  }

  response.json(userFunctions.forbiddenJSON)
}
