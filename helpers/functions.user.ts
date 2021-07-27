import type { Request, Response } from "express";


const getPermission = (request: Request, permissionName: string): boolean => {

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


export const userCanCreate = (request: Request): boolean => {
  return getPermission(request, "canCreate");
};


export const userIsOperator = (request: Request): boolean => {
  return getPermission(request, "isOperator");
};


export const getHashString = (userName: string, passwordPlain: string): string => {
  return userName + "::" + passwordPlain;
};


export const forbiddenJSON = (response: Response): Response => {
  return response
    .status(403)
    .json({
      success: false,
      message: "Forbidden"
    });
};
