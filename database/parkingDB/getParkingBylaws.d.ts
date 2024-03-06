import type { ParkingBylaw } from '../../types/recordTypes.js';
export interface AddUpdateParkingBylawReturn {
    success: boolean;
    message?: string;
    bylaws?: ParkingBylaw[];
}
export default function getParkingBylaws(): ParkingBylaw[];
export declare function getParkingBylawsWithOffenceStats(): ParkingBylaw[];
