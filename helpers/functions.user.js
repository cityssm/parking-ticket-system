function getPermission(request, permissionName) {
    const user = request.session?.user;
    if (user === undefined) {
        return false;
    }
    return user[permissionName] ?? false;
}
export function userIsAdmin(request) {
    return getPermission(request, 'isAdmin');
}
export function userCanUpdate(request) {
    return getPermission(request, 'canUpdate');
}
export function userIsOperator(request) {
    return getPermission(request, 'isOperator');
}
export function forbiddenJSON(response) {
    return response.status(403).json({
        success: false,
        message: 'Forbidden'
    });
}
