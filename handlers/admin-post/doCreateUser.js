import createUser from "../../helpers/usersDB/createUser.js";
export const handler = (req, res) => {
    const newPassword = createUser(req.body);
    if (!newPassword) {
        res.json({
            success: false,
            message: "New Account Not Created"
        });
    }
    else {
        res.json({
            success: true,
            newPassword
        });
    }
};
export default handler;
