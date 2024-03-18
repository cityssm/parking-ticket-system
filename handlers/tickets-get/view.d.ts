/// <reference types="cookie-parser" />
import type { Request, Response } from 'express';
export interface TicketsViewParameters {
    ticketId: `${number}`;
}
export default function handler(request: Request<TicketsViewParameters>, response: Response): Promise<void>;
