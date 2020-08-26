"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const usersDB_getUserProperties = require("../../helpers/usersDB/getUserProperties");
exports.handler = (req, res) => {
    const userProperties = usersDB_getUserProperties.getUserProperties(req.body.userName);
    return res.json(userProperties);
};
