/// <reference types="cookie-parser" />
import type { Request, Response } from 'express';
export interface TicketsEditParameters {
    ticketId: `${number}`;
}
export default function handler(request: Request<TicketsEditParameters>, response: Response): Promise<void>;
