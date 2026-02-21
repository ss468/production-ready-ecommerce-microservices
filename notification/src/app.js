const express = require('express');
const cors = require('cors');
const config = require('./config');
const MessageBroker = require('./utils/messageBroker');

class App {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupMessageBroker();
  }

  setupMiddlewares() {
    this.app.use(
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: '*',
        credentials: false,
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    // Log all incoming requests
    this.app.use((req, res, next) => {
      console.log(
        `[Notification Service] [${new Date().toISOString()}] ${req.method} ${req.path}`
      );
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'Notification Service is running', timestamp: new Date() });
    });

    this.app.get('/', (req, res) => {
      res.json({ 
        service: 'Notification Service',
        version: '1.0.0',
        status: 'active'
      });
    });
  }

  setupMessageBroker() {
    MessageBroker.connect();
  }

  start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(config.port, () => {
        console.log(
          `Notification Service started successfully on port ${config.port}`
        );
        resolve();
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Notification Service stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = App;
