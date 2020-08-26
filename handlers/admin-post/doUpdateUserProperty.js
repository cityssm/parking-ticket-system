"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const usersDB_updateUserProperty = require("../../helpers/usersDB/updateUserProperty");
exports.handler = (req, res) => {
    const changeCount = usersDB_updateUserProperty.updateUserProperty(req.body);
    res.json({
        success: (changeCount === 1)
    });
};
