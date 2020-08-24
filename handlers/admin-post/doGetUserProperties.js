"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const usersDB_getUserProperties = require("../../helpers/usersDB/getUserProperties");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const userProperties = usersDB_getUserProperties.getUserProperties(req.body.userName);
    return res.json(userProperties);
};
