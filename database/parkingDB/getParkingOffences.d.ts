import type { ParkingOffence } from '../../types/recordTypes.js';
export interface AddUpdateParkingOffenceReturn {
    success: boolean;
    message?: string;
    offences?: ParkingOffence[];
}
export default function getParkingOffences(): ParkingOffence[];
export declare function getParkingOffencesByLocationKey(locationKey: string): ParkingOffence[];
