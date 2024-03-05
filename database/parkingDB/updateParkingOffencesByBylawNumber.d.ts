import type { ParkingBylaw } from '../../types/recordTypes.js';
export interface UpdateParkingOffencesByBylawNumberForm {
    bylawNumber: string;
    offenceAmount: string;
    discountDays: string;
    discountOffenceAmount: string;
}
export declare function updateParkingOffencesByBylawNumber(requestBody: UpdateParkingOffencesByBylawNumberForm): {
    success: boolean;
    bylaws?: ParkingBylaw[];
};
export default updateParkingOffencesByBylawNumber;
