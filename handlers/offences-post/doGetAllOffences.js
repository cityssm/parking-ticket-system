import { getParkingOffences } from '../../database/parkingDB/getParkingOffences.js';
export const handler = (_request, response) => {
    response.json(getParkingOffences());
};
export default handler;
