import type { Request, Response } from "express";
import type * as pts from "../helpers/ptsTypes";


export const userIsAdmin = (req: Request) => {

  const user = req.session?.user as pts.User;

  if (!user) {
    return false;
  }

  return user.userProperties.isAdmin;
};


export const userCanUpdate = (req: Request) => {

  const user = req.session?.user as pts.User;

  if (!user) {
    return false;
  }

  return user.userProperties.canUpdate;
};


export const userCanCreate = (req: Request) => {

  const user = req.session?.user as pts.User;

  if (!user) {
    return false;
  }

  return user.userProperties.canCreate;
};


export const userIsOperator = (req: Request) => {

  const user = req.session?.user as pts.User;

  if (!user) {
    return false;
  }

  return user.userProperties.isOperator;
};


export const forbiddenJSON = (res: Response) => {
  return res
    .status(403)
    .json({
      success: false,
      message: "Forbidden"
    });
};
