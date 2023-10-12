import { getDatabaseCleanupCounts } from '../../database/parkingDB/getDatabaseCleanupCounts.js';
export const handler = (_request, response) => {
    const counts = getDatabaseCleanupCounts();
    response.render('admin-cleanup', {
        headTitle: 'Database Cleanup',
        counts
    });
};
export default handler;
