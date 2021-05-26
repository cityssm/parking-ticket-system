import updateUser from "../../helpers/usersDB/updateUser.js";
export const handler = (req, res) => {
    const changeCount = updateUser(req.body);
    res.json({
        success: (changeCount === 1)
    });
};
export default handler;
