/// <reference types="cookie-parser" />
import type { Request, Response } from 'express';
import type { ParkingTicketRemark } from '../../types/recordTypes.js';
export interface DoAddRemarkReturn {
    remarkIndex: number;
    remarks: ParkingTicketRemark[];
}
export default function handler(request: Request, response: Response): void;
