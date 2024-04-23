import type { RequestHandler } from 'express'

import { getConfigProperty } from '../helpers/functions.config.js'
import {
  forbiddenJSON,
  userCanUpdate,
  userIsAdmin,
  userIsOperator
} from '../helpers/functions.user.js'

const dashboardRedirectUrl = `${getConfigProperty(
  'reverseProxy.urlPrefix'
)}/dashboard`

export const adminGetHandler: RequestHandler = (request, response, next) => {
  if (userIsAdmin(request)) {
    next()
    return
  }

  response.redirect(dashboardRedirectUrl)
}

export const adminPostHandler: RequestHandler = (request, response, next) => {
  if (userIsAdmin(request)) {
    next()
    return
  }

  response.json(forbiddenJSON(response))
}

export const updateGetHandler: RequestHandler = (request, response, next) => {
  if (userCanUpdate(request)) {
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
  if (userCanUpdate(request) || userIsOperator(request)) {
    next()
    return
  }

  response.redirect(dashboardRedirectUrl)
}

export const updatePostHandler: RequestHandler = (request, response, next) => {
  if (userCanUpdate(request)) {
    next()
    return
  }

  response.json(forbiddenJSON(response))
}

export const updateOrOperatorPostHandler: RequestHandler = (
  request,
  response,
  next
) => {
  if (userCanUpdate(request) || userIsOperator(request)) {
    next()
    return
  }

  response.json(forbiddenJSON(response))
}
