"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forbiddenJSON = exports.getHashString = exports.userIsOperator = exports.userCanCreate = exports.userCanUpdate = exports.userIsAdmin = void 0;
exports.userIsAdmin = (req) => {
    var _a;
    const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties.isAdmin;
};
exports.userCanUpdate = (req) => {
    var _a;
    const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties.canUpdate;
};
exports.userCanCreate = (req) => {
    var _a;
    const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties.canCreate;
};
exports.userIsOperator = (req) => {
    var _a;
    const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties.isOperator;
};
exports.getHashString = (userName, passwordPlain) => {
    return userName + "::" + passwordPlain;
};
exports.forbiddenJSON = (res) => {
    return res
        .status(403)
        .json({
        success: false,
        message: "Forbidden"
    });
};
