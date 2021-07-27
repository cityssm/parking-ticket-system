import { updateUserProperty } from "../../helpers/usersDB/updateUserProperty.js";
export const handler = (request, response) => {
    const changeCount = updateUserProperty(request.body);
    response.json({
        success: (changeCount === 1)
    });
};
export default handler;
