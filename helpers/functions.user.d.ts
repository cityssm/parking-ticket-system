import type { Request, Response } from 'express';
export declare const userIsAdmin: (request: Request) => boolean;
export declare const userCanUpdate: (request: Request) => boolean;
export declare const userIsOperator: (request: Request) => boolean;
export declare const forbiddenJSON: (response: Response) => Response;
