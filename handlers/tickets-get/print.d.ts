/// <reference types="cookie-parser" />
import type { Request, Response } from 'express';
export interface TicketsPrintParameters {
    ticketId: `${number}`;
}
export default function handler(request: Request<TicketsPrintParameters>, response: Response): Promise<void>;
