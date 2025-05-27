import UsersDB from "../../config/models/users.js";


const auth = async (req, res, next) => {

  const api_token = req.headers.authorization?.split(' ')[1];
  if (!api_token) {
   return res.status(401).json({ status: 401, message: "token required" });
  }
  try {

    const user = await UsersDB.findOne({ api_token: api_token });

    if (!user) {
      return res.status(401).json({ status: 401, message: "token invalid or expaired" });
    }

    req.userId = user._id;
    req.name = user.name;
    req.email = user.email;
    req.password = user.password;
    req.role = user.role;
    next();

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "internal error" });
  }
};

export default auth;