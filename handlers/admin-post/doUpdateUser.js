import { updateUser } from "../../helpers/usersDB/updateUser.js";
export const handler = (request, response) => {
    const changeCount = updateUser(request.body);
    response.json({
        success: (changeCount === 1)
    });
};
export default handler;
