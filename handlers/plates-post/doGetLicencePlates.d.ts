/// <reference types="cookie-parser" />
import type { Request, Response } from 'express';
import { type GetLicencePlatesReturn } from '../../database/parkingDB/getLicencePlates.js';
export type DoGetLicencePlatesResponse = GetLicencePlatesReturn;
export default function handler(request: Request, response: Response): void;
