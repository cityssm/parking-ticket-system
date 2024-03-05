/// <reference types="qs" />
/// <reference types="cookie-parser" />
import type { Request, Response } from 'express';
export declare const uploadHandler: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare function handler(request: Request, response: Response): void;
export default handler;
