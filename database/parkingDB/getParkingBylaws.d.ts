import type { ParkingBylaw } from '../../types/recordTypes.js';
export interface AddUpdateParkingBylawReturn {
    success: boolean;
    message?: string;
    bylaws?: ParkingBylaw[];
}
export declare const getParkingBylaws: () => ParkingBylaw[];
export declare const getParkingBylawsWithOffenceStats: () => ParkingBylaw[];
export default getParkingBylaws;
