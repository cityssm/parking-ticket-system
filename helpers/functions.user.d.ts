import type { Request, Response } from 'express';
interface RequestWithSessionUser {
    session: {
        user: PTSUser;
    };
}
export declare const userIsAdmin: (request: Partial<Request> | RequestWithSessionUser) => boolean;
export declare const userCanUpdate: (request: Partial<Request> | RequestWithSessionUser) => boolean;
export declare const userIsOperator: (request: Partial<Request> | RequestWithSessionUser) => boolean;
export declare const forbiddenJSON: (response: Response) => Response;
export {};
