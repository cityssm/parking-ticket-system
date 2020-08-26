"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const usersDB_updateUser = require("../../helpers/usersDB/updateUser");
exports.handler = (req, res) => {
    const changeCount = usersDB_updateUser.updateUser(req.body);
    res.json({
        success: (changeCount === 1)
    });
};
