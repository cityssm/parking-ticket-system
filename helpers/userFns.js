const getPermission = (req, permissionName) => {
    var _a;
    const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
    if (!user) {
        return false;
    }
    return user.userProperties[permissionName];
};
export const userIsAdmin = (req) => {
    return getPermission(req, "isAdmin");
};
export const userCanUpdate = (req) => {
    return getPermission(req, "canUpdate");
};
export const userCanCreate = (req) => {
    return getPermission(req, "canCreate");
};
export const userIsOperator = (req) => {
    return getPermission(req, "isOperator");
};
export const getHashString = (userName, passwordPlain) => {
    return userName + "::" + passwordPlain;
};
export const forbiddenJSON = (res) => {
    return res
        .status(403)
        .json({
        success: false,
        message: "Forbidden"
    });
};
