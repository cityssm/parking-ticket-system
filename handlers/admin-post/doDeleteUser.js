import { inactivateUser } from "../../helpers/usersDB/inactivateUser.js";
import { forbiddenJSON } from "../../helpers/functions.user.js";
export const handler = (request, response) => {
    const userNameToDelete = request.body.userName;
    if (userNameToDelete === request.session.user.userName) {
        return forbiddenJSON(response);
    }
    const success = inactivateUser(userNameToDelete);
    return response.json({ success });
};
export default handler;
