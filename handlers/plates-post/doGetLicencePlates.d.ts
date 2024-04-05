/// <reference types="cookie-parser" />
import type { Request, Response } from 'express';
import { type GetLicencePlatesReturn } from '../../database/parkingDB/getLicencePlates.js';
export interface DoGetLicencePlatesBody {
    hasOwnerRecord: '' | '0' | '1';
    hasUnresolvedTickets: '' | '0' | '1';
    licencePlateNumber: string;
    limit: `${number}`;
    offset: `${number}`;
}
export type DoGetLicencePlatesResponse = GetLicencePlatesReturn;
export default function handler(request: Request<unknown, unknown, DoGetLicencePlatesBody>, response: Response<DoGetLicencePlatesResponse>): void;
