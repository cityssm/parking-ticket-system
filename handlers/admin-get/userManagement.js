import usersDB_getAllUsers from "../../helpers/usersDB/getAllUsers.js";
export const handler = (_req, res) => {
    const users = usersDB_getAllUsers();
    return res.render("admin-userManagement", {
        headTitle: "User Management",
        users
    });
};
export default handler;
