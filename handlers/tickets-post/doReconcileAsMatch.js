import createParkingTicketStatus from '../../database/parkingDB/createParkingTicketStatus.js';
import getLicencePlateOwner from '../../database/parkingDB/getLicencePlateOwner.js';
import { getFormattedOwnerAddress } from '../../helpers/functions.owner.js';
export default async function handler(request, response) {
    const ownerRecord = await getLicencePlateOwner(request.body.licencePlateCountry, request.body.licencePlateProvince, request.body.licencePlateNumber, Number.parseInt(request.body.recordDate, 10));
    if (ownerRecord === undefined) {
        response.json({
            success: false,
            message: 'Ownership record not found.'
        });
        return;
    }
    const ownerAddress = getFormattedOwnerAddress(ownerRecord);
    const statusResponse = createParkingTicketStatus({
        recordType: 'status',
        ticketId: Number.parseInt(request.body.ticketId, 10),
        statusKey: 'ownerLookupMatch',
        statusField: ownerRecord.recordDate.toString(),
        statusNote: ownerAddress
    }, request.session.user, false);
    response.json(statusResponse);
}
