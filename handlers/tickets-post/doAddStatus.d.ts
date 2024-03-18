/// <reference types="cookie-parser" />
import type { Request, Response } from 'express';
export interface DoAddStatusBody {
    statusField: string;
    statusField2: string;
    statusKey: string;
    statusNote: string;
    ticketId: `${number}`;
    resolveTicket?: '1';
}
export default function handler(request: Request<unknown, unknown, DoAddStatusBody>, response: Response): void;
