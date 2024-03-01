// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable security/detect-object-injection */

import Debug from 'debug'
import {
  type Request,
  type RequestHandler,
  type Response,
  Router
} from 'express'

import { useTestDatabases } from '../data/databasePaths.js'
import * as authenticationFunctions from '../helpers/functions.authentication.js'
import { getConfigProperty } from '../helpers/functions.config.js'

const debug = Debug('parking-ticket-system:login')

export const router = Router()

async function postHandler(
  request: Request,
  response: Response
): Promise<void> {
  const userName = request.body.userName as string
  const passwordPlain = request.body.password as string

  const unsafeRedirectURL = request.body.redirect

  const redirectURL = authenticationFunctions.getSafeRedirectURL(
    typeof unsafeRedirectURL === 'string' ? unsafeRedirectURL : ''
  )

  let isAuthenticated = false

  if (userName.startsWith('*')) {
    if (useTestDatabases && userName === passwordPlain) {
      isAuthenticated = getConfigProperty('users.testing').includes(userName)

      if (isAuthenticated) {
        debug(`Authenticated testing user: ${userName}`)
      }
    }
  } else {
    isAuthenticated = await authenticationFunctions.authenticate(
      userName,
      passwordPlain
    )
  }

  let userObject: PTSUser | undefined

  if (isAuthenticated) {
    const userNameLowerCase = userName.toLowerCase()

    const canLogin = getConfigProperty('users.canLogin').some(
      (currentUserName) => {
        return userNameLowerCase === currentUserName.toLowerCase()
      }
    )

    if (canLogin) {
      const canUpdate = getConfigProperty('users.canUpdate').some(
        (currentUserName) => {
          return userNameLowerCase === currentUserName.toLowerCase()
        }
      )

      const isAdmin = getConfigProperty('users.isAdmin').some(
        (currentUserName) => {
          return userNameLowerCase === currentUserName.toLowerCase()
        }
      )

      const isOperator = getConfigProperty('users.isOperator').some(
        (currentUserName) => {
          return userNameLowerCase === currentUserName.toLowerCase()
        }
      )

      userObject = {
        userName: userNameLowerCase,
        canUpdate,
        isAdmin,
        isOperator
      }
    }
  }

  if (isAuthenticated && userObject !== undefined) {
    request.session.user = userObject

    response.redirect(redirectURL)
  } else {
    response.render('login', {
      userName,
      message: 'Login Failed',
      redirect: redirectURL,
      useTestDatabases
    })
  }
}

function getHandler(request: Request, response: Response): void {
  const sessionCookieName = getConfigProperty('session.cookieName')

  if (
    request.session.user !== undefined &&
    request.cookies[sessionCookieName] !== undefined
  ) {
    const redirectURL = authenticationFunctions.getSafeRedirectURL(
      (request.query.redirect ?? '') as string
    )

    response.redirect(redirectURL)
  } else {
    response.render('login', {
      userName: '',
      message: '',
      redirect: request.query.redirect,
      useTestDatabases
    })
  }
}

router
  .route('/')
  .get(getHandler)
  .post(postHandler as RequestHandler)

export default router
