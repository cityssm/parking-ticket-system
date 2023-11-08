import * as mtoFunctions from '../../helpers/functions.mto.js';
export const handler = (request, response) => {
    const batchId = Number.parseInt(request.params.batchId, 10);
    const output = mtoFunctions.exportLicencePlateBatch(batchId, request.session.user);
    response.setHeader('Content-Disposition', `attachment; filename=lookupBatch-${batchId.toString()}.txt`);
    response.setHeader('Content-Type', 'text/plain');
    response.send(output);
};
export default handler;
