import bcrypt from 'bcrypt';
import AuthModel from '../models/AuthModel.js';
import Token from '../util/Token.js';
import Email from '../util/MailSender.js';

const LOGIN_FAILED_ERROR = "Email or password is incorrect";

class AuthController {
  constructor() {
  }


  static async Login(request, response) {

    const { email, password } = request.body;

    try {
      const user = await AuthModel.findByEmail(email);
      if (!user) {
        return response.status(400).json({ message: LOGIN_FAILED_ERROR });
      }

      const savedPassword = user.password;

      const comparePass = await bcrypt.compare(password, savedPassword);

      if (!comparePass) {
        return response.status(400).json({ message: LOGIN_FAILED_ERROR });
      }

      const { id, name, role } = user;

      const newToken = await Token.genToken(id, email, name, role, "3h");

      return response.status(200).json({ token: newToken, role: role });

    } catch (error) {
      console.error('Error Login:', error)
      return res.status(500).json({ message: "internal error" });
    }
  };


  // static async forgotPassword(request, response) {

  //   const { email } = request.body;

  //   try {

  //     const user = await AuthModel.findByEmail(email);
  //     if (!user?.email) {
  //       return response.status(401).json("האימייל לא רשום במערכת");
  //     }
  //     const token = await Token.genToken(user.id, null, null, null, "1h");
  //     const emailSent = await Email.sendEmail(email, token, "ressetPass", null);
  //     response.status(200).json(emailSent);
  //   } catch (error) {
  //     console.error(error);
  //     response.status(500).json("Internal server error");
  //   }

  // };

  // // שינוי סיסמה
  // static async resetPassword(request, response) {

  //   const { newPassword } = request.body;
  //   const userId = request.userId;

  //   if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
  //     return response.status(400).json("Password should contain both English characters and numbers");
  //   }

  //   try {
  //     const hashedPassword = await bcrypt.hash(newPassword.toString(), 10);
  //     const user = await AuthModel.resetPassword(userId, hashedPassword);
  //     response.status(200).json("passwoerd reseted successfully");
  //   } catch (error) {
  //     console.log(error);
  //     response.status(500).json("internal error");
  //   }

  // };


}

export default AuthController;


