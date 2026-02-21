const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/userRepository");
const config = require("../config");
const User = require("../models/user");

/**
 * Class to hold the business logic for the auth service interacting with the user repository
 */
class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async findUserByEmail(email) {
    const user = await this.userRepository.getUserByEmail(email);
    return user;
  }

  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    return user;
  }

  async login(email, password) {
    const user = await this.userRepository.getUserByEmail(email);

    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { success: false, message: "Invalid email or password" };
    }

    const token = jwt.sign({ id: user._id }, config.jwtSecret);

    return { success: true, token };
  }

  async register(user) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    return await this.userRepository.createUser(user);
  }

  async deleteTestUsers() {
    // Delete all users with an email that starts with "test"
    await User.deleteMany({ email: /^test/ });
  }
}

module.exports = AuthService;
