import type { RequestHandler } from "express";

import { createConvictionBatch } from "../../helpers/parkingDB/createConvictionBatch.js";


export const handler: RequestHandler = (request, response) => {

  const batchResult = createConvictionBatch(
    request.session
  );

  return response.json(batchResult);
};


export default handler;
