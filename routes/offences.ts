"use strict";

import express = require("express");
const router = express.Router();


router.get("/", function(_req, res) {

  res.render("offence-search", {
    headTitle: "Parking Offences"
  });

});


export = router;
