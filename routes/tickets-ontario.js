"use strict";
const express_1 = require("express");
const router = express_1.Router();
router.get("/convict", function (req, res) {
    if (!req.session.user.userProperties.canUpdate) {
        res.redirect("/tickets/?error=accessDenied");
        return;
    }
    res.render("mto-ticketConvict", {
        headTitle: "Convict Parking Tickets"
    });
});
module.exports = router;
