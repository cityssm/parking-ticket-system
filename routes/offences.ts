import { Router } from "express";

import * as handler_doGetAllLocations from "../handlers/offences-post/doGetAllLocations";
import * as handler_doGetOffencesByLocation from "../handlers/offences-post/doGetOffencesByLocation";
import * as handler_doGetAllOffences from "../handlers/offences-post/doGetAllOffences";


const router = Router();


router.post("/doGetAllLocations",
  handler_doGetAllLocations.handler);


router.post("/doGetOffencesByLocation",
  handler_doGetOffencesByLocation.handler);


router.post("/doGetAllOffences",
  handler_doGetAllOffences.handler);


export = router;
