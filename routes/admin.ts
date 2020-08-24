import { Router } from "express";

import * as handler_userManagement from "../handlers/admin-get/userManagement";

import * as handler_doCreateUser from "../handlers/admin-post/doCreateUser";
import * as handler_doUpdateUser from "../handlers/admin-post/doUpdateUser";
import * as handler_doGetUserProperties from "../handlers/admin-post/doGetUserProperties";
import * as handler_doUpdateUserProperty from "../handlers/admin-post/doUpdateUserProperty";
import * as handler_doResetPassword from "../handlers/admin-post/doResetPassword";
import * as handler_doDeleteUser from "../handlers/admin-post/doDeleteUser";

import * as handler_cleanup from "../handlers/admin-get/cleanup";
import * as handler_doCleanupTable from "../handlers/admin-post/doCleanupTable";

import * as handler_offences from "../handlers/admin-get/offences";
import * as handler_doAddOffence from "../handlers/admin-post/doAddOffence";
import * as handler_doUpdateOffence from "../handlers/admin-post/doUpdateOffence";
import * as handler_doDeleteOffence from "../handlers/admin-post/doDeleteOffence";

import * as handler_locations from "../handlers/admin-get/locations";
import * as handler_doAddLocation from "../handlers/admin-post/doAddLocation";
import * as handler_doUpdateLocation from "../handlers/admin-post/doUpdateLocation";
import * as handler_doDeleteLocation from "../handlers/admin-post/doDeleteLocation";

import * as handler_bylaws from "../handlers/admin-get/bylaws";
import * as handler_doAddBylaw from "../handlers/admin-post/doAddBylaw";
import * as handler_doUpdateBylaw from "../handlers/admin-post/doUpdateBylaw";
import * as handler_doUpdateOffencesByBylaw from "../handlers/admin-post/doUpdateOffencesByBylaw";
import * as handler_doDeleteBylaw from "../handlers/admin-post/doDeleteBylaw";


const router = Router();


// User Management


router.get("/userManagement",
  handler_userManagement.handler);

router.post("/doCreateUser",
  handler_doCreateUser.handler);

router.post("/doUpdateUser",
  handler_doUpdateUser.handler);

router.post("/doUpdateUserProperty",
  handler_doUpdateUserProperty.handler);

router.post("/doResetPassword",
  handler_doResetPassword.handler);

router.post("/doGetUserProperties",
  handler_doGetUserProperties.handler);

router.post("/doDeleteUser",
  handler_doDeleteUser.handler);


// Database Cleanup


router.get("/cleanup",
  handler_cleanup.handler);

router.post("/doCleanupTable",
  handler_doCleanupTable.handler);


// Offence Maintenance


router.get("/offences",
  handler_offences.handler);

router.post("/doAddOffence",
  handler_doAddOffence.handler);

router.post("/doUpdateOffence",
  handler_doUpdateOffence.handler);

router.post("/doDeleteOffence",
  handler_doDeleteOffence.handler);


// Location Maintenance


router.get("/locations",
  handler_locations.handler);

router.post("/doAddLocation",
  handler_doAddLocation.handler);

router.post("/doUpdateLocation",
  handler_doUpdateLocation.handler);

router.post("/doDeleteLocation",
  handler_doDeleteLocation.handler);


// By-Law Maintenance


router.get("/bylaws",
  handler_bylaws.handler);

router.post("/doAddBylaw",
  handler_doAddBylaw.handler);

router.post("/doUpdateBylaw",
  handler_doUpdateBylaw.handler);

router.post("/doUpdateOffencesByBylaw",
  handler_doUpdateOffencesByBylaw.handler);

router.post("/doDeleteBylaw",
  handler_doDeleteBylaw.handler);

export = router;
