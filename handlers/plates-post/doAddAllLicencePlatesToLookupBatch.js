import { addAllLicencePlatesToLookupBatch } from "../../helpers/parkingDB/addLicencePlateToLookupBatch.js";
export const handler = (request, response) => {
    const result = addAllLicencePlatesToLookupBatch(request.body, request.session);
    return response.json(result);
};
export default handler;
