"use strict";

import express = require("express");
const router = express.Router();


router.get("/", function(_req, res) {

  res.render("plate-search", {
    headTitle: "Licence Plates"
  });

});


export = router;
