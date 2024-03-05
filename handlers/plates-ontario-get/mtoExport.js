import getLookupBatch from '../../database/parkingDB/getLookupBatch.js';
export default function handler(_request, response) {
    const latestUnlockedBatch = getLookupBatch(-1);
    response.render('mto-plateExport', {
        headTitle: 'MTO Licence Plate Export',
        batch: latestUnlockedBatch
    });
}
