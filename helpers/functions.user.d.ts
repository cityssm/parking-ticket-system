/// <reference types="cookie-parser" />
import type { Request, Response } from 'express';
interface RequestWithSessionUser {
    session: {
        user: PTSUser;
    };
}
export declare function userIsAdmin(request: Partial<Request> | RequestWithSessionUser): boolean;
export declare function userCanUpdate(request: Partial<Request> | RequestWithSessionUser): boolean;
export declare function userIsOperator(request: Partial<Request> | RequestWithSessionUser): boolean;
export declare function forbiddenJSON(response: Response): Response;
export {};
