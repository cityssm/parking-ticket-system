import * as ownerFunctions from "../../helpers/functions.owner.js";
import { createParkingTicketStatus } from "../../helpers/parkingDB/createParkingTicketStatus.js";
import { getLicencePlateOwner } from "../../helpers/parkingDB/getLicencePlateOwner.js";
export const handler = (request, response) => {
    const ownerRecord = getLicencePlateOwner(request.body.licencePlateCountry, request.body.licencePlateProvince, request.body.licencePlateNumber, request.body.recordDate);
    if (!ownerRecord) {
        return response.json({
            success: false,
            message: "Ownership record not found."
        });
    }
    const ownerAddress = ownerFunctions.getFormattedOwnerAddress(ownerRecord);
    const statusResponse = createParkingTicketStatus({
        recordType: "status",
        ticketID: Number.parseInt(request.body.ticketID, 10),
        statusKey: "ownerLookupMatch",
        statusField: ownerRecord.recordDate.toString(),
        statusNote: ownerAddress
    }, request.session, false);
    return response.json(statusResponse);
};
export default handler;
