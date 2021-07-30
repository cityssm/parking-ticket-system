import { getLastTenConvictionBatches } from "../../helpers/parkingDB/getLastTenConvictionBatches.js";
export const handler = (_request, response) => {
    const batches = getLastTenConvictionBatches();
    return response.json(batches);
};
export default handler;
