import createParkingTicketStatus from '../../database/parkingDB/createParkingTicketStatus.js';
import { getLicencePlateOwner } from '../../database/parkingDB/getLicencePlateOwner.js';
export async function handler(request, response) {
    const ownerRecord = await getLicencePlateOwner(request.body.licencePlateCountry, request.body.licencePlateProvince, request.body.licencePlateNumber, Number.parseInt(request.body.recordDate, 10));
    if (ownerRecord === undefined) {
        response.json({
            success: false,
            message: 'Ownership record not found.'
        });
        return;
    }
    const statusResponse = createParkingTicketStatus({
        recordType: 'status',
        ticketId: Number.parseInt(request.body.ticketId, 10),
        statusKey: 'ownerLookupError',
        statusField: ownerRecord.vehicleNCIC,
        statusNote: ''
    }, request.session.user, false);
    response.json(statusResponse);
}
export default handler;
