const User = require("../models/user");

/**
 * Class to encapsulate the logic for the user repository
 */
class UserRepository {
  async createUser(user) {
    return await User.create(user);
  }

  async getUserByUsername(username) {
    return await User.findOne({ username });
  }

  async getUserByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }
}

module.exports = UserRepository;
