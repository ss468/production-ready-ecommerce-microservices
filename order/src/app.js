const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Order = require("./models/order");
const amqp = require("amqplib");
const config = require("./config");
const isAuthenticated = require("./utils/isAuthenticated");

class App {
  constructor() {
    this.app = express();
    this.setMiddlewares();
    this.registerRoutes();
    this.connectDB();
    this.setupOrderConsumer();
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
    
    // Log all incoming requests
    this.app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  async setupOrderConsumer() {
    // Start connection attempt in background, don't block app startup
    this.connectRabbitMQ();
  }

  connectRabbitMQ(attempt = 1) {
    const maxRetries = 10;
    const baseDelay = 5000; // 5 seconds
    const maxDelay = 30000; // 30 seconds

    console.log(`RabbitMQ connection attempt ${attempt}/${maxRetries}...`);

    amqp.connect(config.rabbitMQUrl)
      .then(async (connection) => {
        console.log("Connected to RabbitMQ");
        const channel = await connection.createChannel();
        await channel.assertQueue("orders");
        await channel.assertQueue("products");

        channel.consume("orders", async (data) => {
          // Consume messages from the order queue on buy
          try {
            console.log("Consuming ORDER service");
            const { products, userId, orderId } = JSON.parse(data.content.toString());

            const newOrder = new Order({
              products,
              user: userId,
              status: 'created',
              totalPrice: products.reduce((acc, product) => acc + product.price, 0),
            });

            // Save order to DB
            await newOrder.save();

            // Send ACK to ORDER service
            channel.ack(data);
            console.log("Order saved to DB and ACK sent to ORDER queue");

            // Send fulfilled order to PRODUCTS service
            // Include orderId in the message
            const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
            channel.sendToQueue(
              "products",
              Buffer.from(JSON.stringify({ orderId, user, products: savedProducts, totalPrice }))
            );
          } catch (error) {
            console.error("Error processing message:", error);
            channel.reject(data, false);
          }
        });
        console.log("Order consumer ready and listening");

        // Handle connection close to attempt reconnect
        connection.on('close', () => {
          console.log('RabbitMQ connection closed. Attempting to reconnect...');
          setTimeout(() => this.connectRabbitMQ(1), baseDelay);
        });
      })
      .catch((err) => {
        const delay = Math.min(baseDelay * attempt, maxDelay);
        console.error(`Connection attempt ${attempt} failed:`, err.message);
        
        if (attempt < maxRetries) {
          console.log(`Retrying in ${delay / 1000} seconds...`);
          setTimeout(() => this.connectRabbitMQ(attempt + 1), delay);
        } else {
          console.error("Max RabbitMQ connection attempts reached. Will continue retrying every 30 seconds.");
          setTimeout(() => this.connectRabbitMQ(1), maxDelay);
        }
      });
  }

  async start() {
    this.setupOrderConsumer(); // Start RabbitMQ connection in background
    this.server = this.app.listen(config.port, () => {
      console.log(`Order service started on port ${config.port}`);
      console.log('Available routes:');
      console.log('  GET /orders - Fetch all orders (requires auth)');
      console.log('  GET /orders/:id/status - Get order status');
    });
  }

  // Expose a simple endpoint to get order status by id
  registerRoutes() {
    // Health check endpoint (no auth required)
    this.app.get('/health', (req, res) => {
      console.log('Health check called');
      res.json({ status: 'Order service is running' });
    });

    // Get all orders for authenticated user
    // Route at root "/" because API Gateway strips "/orders" prefix when proxying
    this.app.get('/', isAuthenticated, async (req, res) => {
      try {
        const userId = req.user.id;
        console.log(`GET / called - fetching orders for user: ${userId}`);
        const orders = await Order.find({ user: userId }).lean();
        console.log(`Found ${orders.length} orders for user ${userId}`);
        return res.json(orders);
      } catch (err) {
        console.error('Error fetching orders', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Also register at /orders for direct access to order service
    this.app.get('/orders', isAuthenticated, async (req, res) => {
      try {
        const userId = req.user.id;
        console.log(`GET /orders called - fetching orders for user: ${userId}`);
        const orders = await Order.find({ user: userId }).lean();
        console.log(`Found ${orders.length} orders for user ${userId}`);
        return res.json(orders);
      } catch (err) {
        console.error('Error fetching orders', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Get order status by id (verify user owns this order)
    this.app.get('/:id/status', isAuthenticated, async (req, res) => {
      try {
        const userId = req.user.id;
        const orderId = req.params.id;
        console.log(`GET /:id/status called for order ${orderId} by user ${userId}`);
        const order = await Order.findById(orderId).lean();
        
        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }
        
        // Verify user owns this order
        if (order.user.toString() !== userId) {
          console.log(`Access denied: User ${userId} tried to access order owned by ${order.user}`);
          return res.status(403).json({ error: 'Forbidden: You can only view your own orders' });
        }
        
        return res.json({ id: order._id, status: order.status });
      } catch (err) {
        console.error('Error fetching order status', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Also register at /orders/:id/status for direct access
    this.app.get('/orders/:id/status', isAuthenticated, async (req, res) => {
      try {
        const userId = req.user.id;
        const orderId = req.params.id;
        console.log(`GET /orders/:id/status called for order ${orderId} by user ${userId}`);
        const order = await Order.findById(orderId).lean();
        
        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }
        
        // Verify user owns this order
        if (order.user.toString() !== userId) {
          console.log(`Access denied: User ${userId} tried to access order owned by ${order.user}`);
          return res.status(403).json({ error: 'Forbidden: You can only view your own orders' });
        }
        
        return res.json({ id: order._id, status: order.status });
      } catch (err) {
        console.error('Error fetching order status', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    console.log('Order routes registered with user filtering:', ['/', '/health', '/orders', '/:id/status', '/orders/:id/status']);
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("Server stopped");
  }
}

module.exports = App;
