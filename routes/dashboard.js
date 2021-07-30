import { Router } from "express";
import * as configFunctions from "../helpers/functions.config.js";
import { tryResetPassword } from "../helpers/usersDB/tryResetPassword.js";
export const router = Router();
router.get("/", (_request, response) => {
    response.render("dashboard", {
        headTitle: "Dashboard"
    });
});
router.post("/doChangePassword", async (request, response) => {
    const userName = request.session.user.userName;
    const oldPassword = request.body.oldPassword;
    const newPassword = request.body.newPassword;
    const result = await tryResetPassword(userName, oldPassword, newPassword);
    response.json(result);
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
