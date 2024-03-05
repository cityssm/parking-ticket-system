import { removeLicencePlateFromLookupBatch } from '../../database/parkingDB/removeLicencePlateFromLookupBatch.js';
export default function handler(request, response) {
    const result = removeLicencePlateFromLookupBatch(request.body, request.session.user);
    response.json(result);
}
