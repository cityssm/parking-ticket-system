import type { Request, Response } from "express";
import type * as pts from "../types/recordTypes";


const getPermission = (req: Request, permissionName: string): boolean => {

  const user = req.session ?.user as pts.User;

  if (!user) {
    return false;
  }

  return user.userProperties[permissionName];
};


export const userIsAdmin = (req: Request) => {
  return getPermission(req, "isAdmin");
};


export const userCanUpdate = (req: Request) => {
  return getPermission(req, "canUpdate");
};


export const userCanCreate = (req: Request) => {
  return getPermission(req, "canCreate");
};


export const userIsOperator = (req: Request) => {
  return getPermission(req, "isOperator");
};


export const getHashString = (userName: string, passwordPlain: string) => {
  return userName + "::" + passwordPlain;
};


export const forbiddenJSON = (res: Response) => {
  return res
    .status(403)
    .json({
      success: false,
      message: "Forbidden"
    });
};
