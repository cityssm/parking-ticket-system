import type { Request, Response } from 'express'

type PermissionName = 'isAdmin' | 'canUpdate' | 'isOperator'

interface RequestWithSessionUser {
  session: {
    user: PTSUser
  }
}

function getPermission(
  request: Partial<Request> | RequestWithSessionUser,
  permissionName: PermissionName
): boolean {
  const user = request.session?.user

  if (user === undefined) {
    return false
  }

  return user[permissionName] ?? false
}

export function userIsAdmin(
  request: Partial<Request> | RequestWithSessionUser
): boolean {
  return getPermission(request, 'isAdmin')
}

export function userCanUpdate(
  request: Partial<Request> | RequestWithSessionUser
): boolean {
  return getPermission(request, 'canUpdate')
}

export function userIsOperator(
  request: Partial<Request> | RequestWithSessionUser
): boolean {
  return getPermission(request, 'isOperator')
}

export function forbiddenJSON(response: Response): Response {
  return response.status(403).json({
    success: false,
    message: 'Forbidden'
  })
}
