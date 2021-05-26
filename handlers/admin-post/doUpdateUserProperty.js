import updateUserProperty from "../../helpers/usersDB/updateUserProperty.js";
export const handler = (req, res) => {
    const changeCount = updateUserProperty(req.body);
    res.json({
        success: (changeCount === 1)
    });
};
export default handler;
