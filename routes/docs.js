"use strict";
const express_1 = require("express");
const createError = require("http-errors");
const fs = require("fs");
const path = require("path");
const marked = require("marked");
const configFns = require("../helpers/configFns");
const sanitize = require("sanitize-filename");
const router = express_1.Router();
router.all("/", (_req, res) => {
    res.redirect("/docs/readme.md");
});
router.all("/:mdFileName", (req, res, next) => {
    const mdFileName = sanitize(req.params.mdFileName);
    const mdPath = path.join(__dirname, "..", "docs", mdFileName + (mdFileName.endsWith(".md") ? "" : ".md"));
    fs.readFile(mdPath, "utf8", (err, data) => {
        if (err) {
            next(createError(400));
            return;
        }
        const applicationName = configFns.getProperty("application.applicationName");
        res.send(`<html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Help: ${applicationName}</title>
        <link rel="icon" href="/images/favicon.png" />
        <link rel="stylesheet" href="/stylesheets/docs.min.css" />
      </head>
      <body>
      <article class="markdown-body">` +
            marked(data.toString()) +
            `
      </article>
      </body>
      </html>`);
    });
});
module.exports = router;
