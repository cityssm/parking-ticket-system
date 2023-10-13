import type { ParkingOffence } from '../../types/recordTypes.js';
export interface AddUpdateParkingOffenceReturn {
    success: boolean;
    message?: string;
    offences?: ParkingOffence[];
}
export declare const getParkingOffences: () => ParkingOffence[];
export declare const getParkingOffencesByLocationKey: (locationKey: string) => ParkingOffence[];
export default getParkingOffences;
