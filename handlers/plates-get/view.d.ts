/// <reference types="cookie-parser" />
import type { Request, Response } from 'express';
export interface PlatesViewParameters {
    licencePlateCountry: '_' | string;
    licencePlateProvince: '_' | string;
    licencePlateNumber: '_' | string;
}
export default function handler(request: Request<PlatesViewParameters>, response: Response): Promise<void>;
