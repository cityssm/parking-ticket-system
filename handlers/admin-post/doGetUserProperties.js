import { getUserProperties } from "../../helpers/usersDB/getUserProperties.js";
export const handler = (request, response) => {
    const userProperties = getUserProperties(request.body.userName);
    return response.json(userProperties);
};
export default handler;
