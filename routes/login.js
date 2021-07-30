import { Router } from "express";
import * as configFunctions from "../helpers/functions.config.js";
import * as usersDB_getUser from "../helpers/usersDB/getUser.js";
export const router = Router();
const getSafeRedirectURL = (possibleRedirectURL = "") => {
    switch (possibleRedirectURL) {
        case "/tickets":
        case "/tickets/new":
        case "/tickets/reconcile":
        case "/tickets-ontario/convict":
        case "/plates":
        case "/plates-ontario/mtoExport":
        case "/plates-ontario/mtoImport":
        case "/reports":
        case "/admin/userManagement":
        case "/admin/cleanup":
        case "/admin/offences":
        case "/admin/locations":
        case "/admin/bylaws":
            return possibleRedirectURL;
    }
    return "/dashboard";
};
router.route("/")
    .get((request, response) => {
    const sessionCookieName = configFunctions.getProperty("session.cookieName");
    if (request.session.user && request.cookies[sessionCookieName]) {
        const redirectURL = getSafeRedirectURL((request.query.redirect || ""));
        response.redirect(redirectURL);
    }
    else {
        response.render("login", {
            userName: "",
            message: "",
            redirect: request.query.redirect
        });
    }
})
    .post(async (request, response) => {
    const userName = request.body.userName;
    const passwordPlain = request.body.password;
    const redirectURL = getSafeRedirectURL(request.body.redirect);
    const userObject = await usersDB_getUser.getUser(userName, passwordPlain);
    if (userObject) {
        request.session.user = userObject;
        response.redirect(request.body.redirect);
    }
    else {
        response.render("login", {
            userName,
            message: "Login Failed",
            redirect: redirectURL
        });
    }
});
export default router;
