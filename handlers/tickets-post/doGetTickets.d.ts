/// <reference types="cookie-parser" />
import type { Request, Response } from 'express';
import { type GetParkingTicketsReturn } from '../../database/parkingDB/getParkingTickets.js';
interface DoGetTicketsBody {
    isResolved: '' | '0' | '1';
    licencePlateNumber: string;
    limit: `${number}`;
    location: string;
    offset: `${number}`;
    ticketNumber: string;
}
export type DoGetTicketsResponse = GetParkingTicketsReturn;
export default function handler(request: Request<unknown, unknown, DoGetTicketsBody>, response: Response<DoGetTicketsResponse>): void;
export {};
