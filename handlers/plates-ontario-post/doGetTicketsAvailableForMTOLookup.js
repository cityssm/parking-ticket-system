import { getParkingTicketsAvailableForMTOLookup } from "../../helpers/parkingDB-ontario/getParkingTicketsAvailableForMTOLookup.js";
export const handler = (request, response) => {
    const batchID = Number.parseInt(request.body.batchID, 10);
    const issueDaysAgo = Number.parseInt(request.body.issueDaysAgo, 10);
    const tickets = getParkingTicketsAvailableForMTOLookup(batchID, issueDaysAgo);
    return response.json({
        tickets
    });
};
export default handler;
