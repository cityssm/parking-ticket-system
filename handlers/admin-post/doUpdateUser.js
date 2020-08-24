"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const usersDB_updateUser = require("../../helpers/usersDB/updateUser");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const changeCount = usersDB_updateUser.updateUser(req.body);
    res.json({
        success: (changeCount === 1)
    });
};
