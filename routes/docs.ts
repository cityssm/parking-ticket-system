import { Router } from "express";
const router = Router();

import * as createError from "http-errors";
import * as fs from "fs";
import * as path from "path";
import * as marked from "marked";

import * as configFns from "../helpers/configFns";


router.all("/", function(_req, res) {

  res.redirect("/docs/readme.md");

});


router.all("/:mdFileName", function(req, res, next) {

  const mdFileName = req.params.mdFileName;

  const mdPath = path.join(__dirname, "..", "docs", mdFileName + (mdFileName.endsWith(".md") ? "" : ".md"));

  fs.readFile(mdPath, "utf8", function(err, data) {

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


export = router;
