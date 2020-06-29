import type { Request, Response } from "express";
export declare const userIsAdmin: (req: Request) => boolean;
export declare const userCanUpdate: (req: Request) => boolean;
export declare const userIsOperator: (req: Request) => boolean;
export declare const forbiddenJSON: (res: Response) => Response<any>;
