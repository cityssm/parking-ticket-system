import { Router } from "express";
import handler_doGetAllLocations from "../handlers/offences-post/doGetAllLocations.js";
import handler_doGetOffencesByLocation from "../handlers/offences-post/doGetOffencesByLocation.js";
import handler_doGetAllOffences from "../handlers/offences-post/doGetAllOffences.js";
export const router = Router();
router.post("/doGetAllLocations", handler_doGetAllLocations.handler);
router.post("/doGetOffencesByLocation", handler_doGetOffencesByLocation.handler);
router.post("/doGetAllOffences", handler_doGetAllOffences.handler);
export default router;
