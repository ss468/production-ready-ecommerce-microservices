const AuthService = require("../services/authService");

/**
 * Class to encapsulate the logic for the auth routes
 */

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await this.authService.login(email, password);

    if (result.success) {
      res.json({ token: result.token });
    } else {
      res.status(400).json({ message: result.message });
    }
  }

  async register(req, res) {
    const user = req.body;
  
    try {
      if (!user.email || !user.password) {
        throw new Error("Email and password are required");
      }

      const existingUser = await this.authService.findUserByEmail(user.email);
  
      if (existingUser) {
        console.log("Email already registered")
        throw new Error("Email already registered");
      }
  
      const result = await this.authService.register(user);
      res.json({ message: "Registration successful", email: result.email });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await this.authService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

module.exports = AuthController;
