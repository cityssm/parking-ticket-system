const getPermission = (request, permissionName) => {
    const user = request.session?.user;
    if (user === undefined) {
        return false;
    }
    return user[permissionName] ?? false;
};
export const userIsAdmin = (request) => {
    return getPermission(request, 'isAdmin');
};
export const userCanUpdate = (request) => {
    return getPermission(request, 'canUpdate');
};
export const userIsOperator = (request) => {
    return getPermission(request, 'isOperator');
};
export const forbiddenJSON = (response) => {
    return response.status(403).json({
        success: false,
        message: 'Forbidden'
    });
};
