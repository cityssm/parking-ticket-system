"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forbiddenJSON = exports.userIsOperator = exports.userCanCreate = exports.userCanUpdate = exports.userIsAdmin = void 0;
exports.userIsAdmin = (req) => {
    const user = req.session.user;
    if (!user) {
        return false;
    }
    return user.userProperties.isAdmin;
};
exports.userCanUpdate = (req) => {
    const user = req.session.user;
    if (!user) {
        return false;
    }
    return user.userProperties.canUpdate;
};
exports.userCanCreate = (req) => {
    const user = req.session.user;
    if (!user) {
        return false;
    }
    return user.userProperties.canCreate;
};
exports.userIsOperator = (req) => {
    const user = req.session.user;
    if (!user) {
        return false;
    }
    return user.userProperties.isOperator;
};
exports.forbiddenJSON = (res) => {
    return res
        .status(403)
        .json({
        success: false,
        message: "Forbidden"
    });
};
