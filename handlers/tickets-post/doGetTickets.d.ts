/// <reference types="cookie-parser" />
import type { Request, Response } from 'express';
import { type GetParkingTicketsReturn } from '../../database/parkingDB/getParkingTickets.js';
export type DoGetTicketsResponse = GetParkingTicketsReturn;
export default function handler(request: Request, response: Response): void;
