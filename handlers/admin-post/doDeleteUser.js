import inactivateUser from "../../helpers/usersDB/inactivateUser.js";
import { forbiddenJSON } from "../../helpers/userFns.js";
export const handler = (req, res) => {
    const userNameToDelete = req.body.userName;
    if (userNameToDelete === req.session.user.userName) {
        return forbiddenJSON(res);
    }
    const success = inactivateUser(userNameToDelete);
    return res.json({ success });
};
export default handler;
