import type { Request, Response } from "express";


type PermissionName = "isAdmin" | "canUpdate" | "isOperator";


const getPermission = (request: Request, permissionName: PermissionName) : boolean => {

  const user = request.session?.user;

  if (!user) {
    return false;
  }

  return user.userProperties[permissionName];
};


export const userIsAdmin = (request: Request): boolean => {
  return getPermission(request, "isAdmin");
};


export const userCanUpdate = (request: Request): boolean => {
  return getPermission(request, "canUpdate");
};


export const userIsOperator = (request: Request): boolean => {
  return getPermission(request, "isOperator");
};


export const forbiddenJSON = (response: Response): Response => {
  return response
    .status(403)
    .json({
      success: false,
      message: "Forbidden"
    });
};
