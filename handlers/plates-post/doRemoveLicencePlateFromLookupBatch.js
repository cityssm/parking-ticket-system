import { removeLicencePlateFromLookupBatch } from '../../database/parkingDB/removeLicencePlateFromLookupBatch.js';
export const handler = (request, response) => {
    const result = removeLicencePlateFromLookupBatch(request.body, request.session);
    return response.json(result);
};
export default handler;
