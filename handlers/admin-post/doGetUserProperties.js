import getUserProperties from "../../helpers/usersDB/getUserProperties.js";
export const handler = (req, res) => {
    const userProperties = getUserProperties(req.body.userName);
    return res.json(userProperties);
};
export default handler;
