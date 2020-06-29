import type { Request, Response } from "express";
import type * as pts from "../helpers/ptsTypes";


export const userIsAdmin = (req: Request) => {

  const user = <pts.User>req.session.user;

  if (!user) {
    return false;
  }

  return user.userProperties.isAdmin;
};


export const userCanUpdate = (req: Request) => {

  const user = <pts.User>req.session.user;

  if (!user) {
    return false;
  }

  return user.userProperties.canUpdate;
};


export const userIsOperator = (req: Request) => {

  const user = <pts.User>req.session.user;

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
