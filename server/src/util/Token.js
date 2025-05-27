import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

class Token {
  constructor() {
  }

  static async genToken(id, email, name, role, expired) {    

    let token = jwt.sign({ _id: id, _email: email, _name: name, _role: role}, process.env.SECRET_WORD, { expiresIn: expired })
    return token;
  }

}

export default Token;
