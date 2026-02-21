const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./config");
const authMiddleware = require("./middlewares/authMiddleware");
const AuthController = require("./controllers/authController");

class App {
  constructor() {
    this.app = express();
    this.authController = new AuthController();
    this.connectDB();
    this.setMiddlewares();
    this.setRoutes();
  }

  async connectDB() {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }

  setMiddlewares() {
    this.app.use(cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: "*",
      credentials: false
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  setRoutes() {
    // Health check endpoint
    this.app.get("/health", (req, res) => {
      console.log('[Auth Service] Health check called');
      res.json({ status: 'Auth service is running' });
    });
    
    this.app.post("/login", (req, res) => this.authController.login(req, res));
    this.app.post("/register", (req, res) => this.authController.register(req, res));
    this.app.get("/profile", authMiddleware, (req, res) => this.authController.getProfile(req, res));
    this.app.get("/dashboard", authMiddleware, (req, res) => res.json({ message: "Welcome to dashboard" }));
    
    // Internal endpoint for notification service to fetch user email by ID
    this.app.get("/users/:id", async (req, res) => {
      try {
        const userId = req.params.id;
        console.log(`[Auth Service] GET /users/:id called with userId: ${userId}`);
        
        const user = await this.authController.authService.getUserById(userId);
        console.log(`[Auth Service] User found:`, user ? `${user.email}` : 'null');
        
        if (!user) {
          console.log(`[Auth Service] User not found for ID: ${userId}`);
          return res.status(404).json({ message: "User not found" });
        }
        
        console.log(`[Auth Service] Successfully returning user email: ${user.email}`);
        res.json({ email: user.email, id: user._id });
      } catch (err) {
        console.error("[Auth Service] Error fetching user:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
      }
    });
  }

  start() {
    this.server = this.app.listen(3000, () => console.log("Server started on port 3000"));
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("Server stopped");
  }
}

module.exports = App;
