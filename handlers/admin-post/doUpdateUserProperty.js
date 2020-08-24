"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const usersDB_updateUserProperty = require("../../helpers/usersDB/updateUserProperty");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const changeCount = usersDB_updateUserProperty.updateUserProperty(req.body);
    res.json({
        success: (changeCount === 1)
    });
};
