import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js';
import markConvictionBatchAsSent from '../../database/parkingDB/markConvictionBatchAsSent.js';
export default function handler(request, response) {
    const batchId = Number.parseInt(request.params.batchId, 10);
    const batch = getConvictionBatch(batchId);
    if (batch !== undefined && batch.sentDate === undefined) {
        markConvictionBatchAsSent(batchId, request.session.user);
    }
    response.render('ticketConvict-print', {
        headTitle: 'Parking Tickets Conviction Batch',
        batch
    });
}
