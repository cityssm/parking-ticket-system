const getPermission = (request, permissionName) => {
    const user = request.session?.user;
    if (!user) {
        return false;
    }
    return user.userProperties[permissionName];
};
export const userIsAdmin = (request) => {
    return getPermission(request, "isAdmin");
};
export const userCanUpdate = (request) => {
    return getPermission(request, "canUpdate");
};
export const userCanCreate = (request) => {
    return getPermission(request, "canCreate");
};
export const userIsOperator = (request) => {
    return getPermission(request, "isOperator");
};
export const getHashString = (userName, passwordPlain) => {
    return userName + "::" + passwordPlain;
};
export const forbiddenJSON = (response) => {
    return response
        .status(403)
        .json({
        success: false,
        message: "Forbidden"
    });
};
