"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const usersDB_generateNewPassword = require("../../helpers/usersDB/generateNewPassword");
exports.handler = (req, res) => {
    const newPassword = usersDB_generateNewPassword.generateNewPassword(req.body.userName);
    return res.json({
        success: true,
        newPassword
    });
};
