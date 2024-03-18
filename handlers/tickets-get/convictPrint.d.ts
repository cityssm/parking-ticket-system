/// <reference types="cookie-parser" />
import type { Request, Response } from 'express';
export interface TicketsConvictPrintParameters {
    batchId: `${number}`;
}
export default function handler(request: Request<TicketsConvictPrintParameters>, response: Response): void;
