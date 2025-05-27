import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config();

const auth = async (req, res, next) => {

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json("token required");
    }
    try {
        let decodeToken = jwt.verify(token, process.env.SECRET_WORD);
        req.userId = decodeToken._id;
        req.email = decodeToken._email;
        req.role = decodeToken._role;
        req.name = decodeToken._name;
        next();

    } catch (error) {
        console.error(error);
        res.status(401).json("token invalid or expaired");
    }
};

export default auth;