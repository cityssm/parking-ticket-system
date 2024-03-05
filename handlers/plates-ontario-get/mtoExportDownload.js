import { exportLicencePlateBatch } from '../../helpers/functions.mto.js';
export default function handler(request, response) {
    const batchId = Number.parseInt(request.params.batchId, 10);
    const output = exportLicencePlateBatch(batchId, request.session.user);
    response.setHeader('Content-Disposition', `attachment; filename=lookupBatch-${batchId.toString()}.txt`);
    response.setHeader('Content-Type', 'text/plain');
    response.send(output);
}
