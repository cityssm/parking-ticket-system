import { updateUser } from "../../helpers/usersDB/updateUser.js";
export const handler = (request, response) => {
    const success = updateUser(request.body);
    response.json({
        success
    });
};
export default handler;
