/// <reference types="qs" />
import type { Request } from "express";
import type { Session } from "express-session";
export declare const testView = "*testView";
export declare const testUpdate = "*testUpdate";
export declare const testAdmin = "*testAdmin";
export declare const fakeViewOnlySession: Session;
export declare const fakeAdminSession: Session;
export declare const fakeRequest: Request;
export declare const fakeViewOnlyRequest: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>> & {
    session: Session;
};
export declare const fakeAdminRequest: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>> & {
    session: Session;
};
