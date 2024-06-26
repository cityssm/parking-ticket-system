import getUnreceivedLookupBatches from '../../database/parkingDB/getUnreceivedLookupBatches.js';
export default function handler(_request, response) {
    const unreceivedBatches = getUnreceivedLookupBatches(false);
    response.render('mto-plateImport', {
        headTitle: 'MTO Licence Plate Ownership Import',
        batches: unreceivedBatches
    });
}
