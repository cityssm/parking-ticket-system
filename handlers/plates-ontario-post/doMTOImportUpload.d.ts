/// <reference types="qs" />
import type { RequestHandler } from "express";
export declare const uploadHandler: RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const handler: RequestHandler;
export default handler;
