const Product = require("../models/product");
const messageBroker = require("../utils/messageBroker");
const uuid = require('uuid');

/**
 * Class to hold the API implementation for the product services
 */
class ProductController {

  constructor() {
    this.createOrder = this.createOrder.bind(this);
    this.getOrderStatus = this.getOrderStatus.bind(this);
    this.ordersMap = new Map();

  }

  async createProduct(req, res, next) {
    try {
      const product = new Product(req.body);

      const validationError = product.validateSync();
      if (validationError) {
        return res.status(400).json({ message: validationError.message });
      }

      await product.save({ timeout: 30000 });

      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async createOrder(req, res, next) {
    try {
      const { ids } = req.body;
      const products = await Product.find({ _id: { $in: ids } });
  
      const orderId = uuid.v4(); // Generate a unique order ID
      const createdAt = new Date();
      
      this.ordersMap.set(orderId, { 
        _id: orderId,
        status: "pending", 
        products, 
        userId: req.user.id,
        createdAt
      });
  
      // Publish order message to RabbitMQ
      await messageBroker.publishMessage("orders", {
        products,
        userId: req.user.id,
        orderId
      });

      messageBroker.consumeMessage("products", (data) => {
        const orderData = JSON.parse(JSON.stringify(data));
        const { orderId: completedOrderId } = orderData;
        const order = this.ordersMap.get(completedOrderId);
        if (order) {
          this.ordersMap.set(completedOrderId, { ...order, ...orderData, status: 'completed' });
          console.log("Order completed:", completedOrderId);
        }
      });
  
      // Long polling with timeout - wait max 10 seconds for order completion
      let order = this.ordersMap.get(orderId);
      let attempts = 0;
      const maxAttempts = 10;
      
      while (order.status === 'pending' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        order = this.ordersMap.get(orderId);
        attempts++;
      }
  
      // Return order details with _id (orderId)
      return res.status(201).json({
        _id: orderId,
        status: order.status,
        products: order.products,
        totalPrice: order.products.reduce((sum, p) => sum + (p.price || 0), 0),
        createdAt: order.createdAt
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
  

  async getOrderStatus(req, res, next) {
    const { orderId } = req.params;
    const order = this.ordersMap.get(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.status(200).json(order);
  }

  async getProducts(req, res, next) {
    try {
      const products = await Product.find({});
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = ProductController;
