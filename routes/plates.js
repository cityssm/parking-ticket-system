"use strict";
const express = require("express");
const router = express.Router();
router.get("/", function (_req, res) {
    res.render("plate-search", {
        headTitle: "Licence Plates"
    });
});
module.exports = router;
