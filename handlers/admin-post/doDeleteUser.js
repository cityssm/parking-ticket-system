"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const usersDB_inactivateUser = require("../../helpers/usersDB/inactivateUser");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    const userNameToDelete = req.body.userName;
    if (userNameToDelete === req.session.user.userName) {
        return userFns_1.forbiddenJSON(res);
    }
    const success = usersDB_inactivateUser.inactivateUser(userNameToDelete);
    return res.json({ success });
};
