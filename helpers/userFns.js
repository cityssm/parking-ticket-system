"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forbiddenJSON = exports.getHashString = exports.userIsOperator = exports.userCanCreate = exports.userCanUpdate = exports.userIsAdmin = void 0;
const getPermission = (req, permissionName) => {
    var _a;
    const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties[permissionName];
};
exports.userIsAdmin = (req) => {
    return getPermission(req, "isAdmin");
};
exports.userCanUpdate = (req) => {
    return getPermission(req, "canUpdate");
};
exports.userCanCreate = (req) => {
    return getPermission(req, "canCreate");
};
exports.userIsOperator = (req) => {
    return getPermission(req, "isOperator");
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
