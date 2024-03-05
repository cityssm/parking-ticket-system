import multer from 'multer';
import * as mtoFunctions from '../../helpers/functions.mto.js';
const storage = multer.memoryStorage();
const upload = multer({ storage });
export const uploadHandler = upload.single('importFile');
export const handler = (request, response) => {
    const batchId = request.body.batchId;
    const ownershipData = request.file?.buffer.toString() ?? '';
    const results = mtoFunctions.importLicencePlateOwnership(Number.parseInt(batchId, 10), ownershipData, request.session.user);
    return response.json(results);
};
export default handler;
