"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const usersDB_generateNewPassword = require("../../helpers/usersDB/generateNewPassword");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const newPassword = usersDB_generateNewPassword.generateNewPassword(req.body.userName);
    return res.json({
        success: true,
        newPassword
    });
};
