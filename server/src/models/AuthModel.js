import dotenv from 'dotenv';
import UsersDB from '../../config/models/users.js';
dotenv.config();

class AuthModel {
  constructor() { }

  // Check if email exists
  static async findByEmail(email) {
    const user = await UsersDB.findOne(
      { email },
      { _id: 1, password: 1, email: 1, name: 1, role: 1}
    );
    return user;
  }



  // Handle reset password
  static async resetPassword(userId, newPassword) {
    const updatedUser = await UsersDB.findByIdAndUpdate(
      userId,
      { password: newPassword },
      { new: true } // מחזיר את המסמך המעודכן (optional)
    );
    return updatedUser;
  }
  

}

export default AuthModel;
