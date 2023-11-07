import { Router } from 'express';
import { getConfigProperty } from '../helpers/functions.config.js';
export const router = Router();
router.get('/', (_request, response) => {
    response.render('dashboard', {
        headTitle: 'Dashboard'
    });
});
router.all('/doGetDefaultConfigProperties', (_request, response) => {
    response.json({
        locationClasses: getConfigProperty('locationClasses'),
        ticketNumber_fieldLabel: getConfigProperty('parkingTickets.ticketNumber.fieldLabel'),
        parkingTicketStatuses: getConfigProperty('parkingTicketStatuses'),
        licencePlateCountryAliases: getConfigProperty('licencePlateCountryAliases'),
        licencePlateProvinceAliases: getConfigProperty('licencePlateProvinceAliases'),
        licencePlateProvinces: getConfigProperty('licencePlateProvinces')
    });
});
export default router;
