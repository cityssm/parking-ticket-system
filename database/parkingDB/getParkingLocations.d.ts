import type { ParkingLocation } from '../../types/recordTypes.js';
export interface AddUpdateParkingLocationReturn {
    success: boolean;
    message?: string;
    locations?: ParkingLocation[];
}
export declare const getParkingLocations: () => ParkingLocation[];
export default getParkingLocations;
