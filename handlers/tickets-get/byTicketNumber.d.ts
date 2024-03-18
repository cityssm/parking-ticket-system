/// <reference types="cookie-parser" />
import type { Request, Response } from 'express';
export interface TicketsByTicketNumberParameters {
    ticketNumber: string;
}
export default function handler(request: Request<TicketsByTicketNumberParameters>, response: Response): void;
