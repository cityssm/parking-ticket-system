"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const usersDB_createUser = require("../../helpers/usersDB/createUser");
exports.handler = (req, res) => {
    const newPassword = usersDB_createUser.createUser(req.body);
    if (!newPassword) {
        res.json({
            success: false,
            message: "New Account Not Created"
        });
    }
    else {
        res.json({
            success: true,
            newPassword
        });
    }
};
