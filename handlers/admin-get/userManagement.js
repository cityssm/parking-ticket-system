import { getAllUsers } from "../../helpers/usersDB/getAllUsers.js";
export const handler = (_request, response) => {
    const users = getAllUsers();
    return response.render("admin-userManagement", {
        headTitle: "User Management",
        users
    });
};
export default handler;
