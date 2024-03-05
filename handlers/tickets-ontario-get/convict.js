import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js';
import { getParkingTicketsAvailableForMTOConvictionBatch } from '../../database/parkingDB-ontario.js';
export default function handler(_request, response) {
    const tickets = getParkingTicketsAvailableForMTOConvictionBatch();
    const batch = getConvictionBatch(-1);
    response.render('mto-ticketConvict', {
        headTitle: 'Convict Parking Tickets',
        tickets,
        batch
    });
}
