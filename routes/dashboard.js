import { Router } from "express";
import * as configFunctions from "../helpers/functions.config.js";
export const router = Router();
router.get("/", (_request, response) => {
    response.render("dashboard", {
        headTitle: "Dashboard"
    });
});
router.all("/doGetDefaultConfigProperties", (_request, response) => {
    response.json({
        locationClasses: configFunctions.getProperty("locationClasses"),
        ticketNumber_fieldLabel: configFunctions.getProperty("parkingTickets.ticketNumber.fieldLabel"),
        parkingTicketStatuses: configFunctions.getProperty("parkingTicketStatuses"),
        licencePlateCountryAliases: configFunctions.getProperty("licencePlateCountryAliases"),
        licencePlateProvinceAliases: configFunctions.getProperty("licencePlateProvinceAliases"),
        licencePlateProvinces: configFunctions.getProperty("licencePlateProvinces")
    });
});
export default router;
