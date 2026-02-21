const amqp = require("amqplib");
const config = require("../config");
const OrderService = require("../services/orderService");

class MessageBroker {
  static async connect() {
    // Start connection attempt in background, don't block app startup
    MessageBroker.connectWithRetry();
  }

  static connectWithRetry(attempt = 1) {
    const maxRetries = 10;
    const baseDelay = 5000; // 5 seconds
    const maxDelay = 30000; // 30 seconds
    
    amqp.connect(config.rabbitMQUrl)
      .then(async (connection) => {
        console.log('Connected to RabbitMQ successfully');
        const channel = await connection.createChannel();

        // Declare the order queue
        await channel.assertQueue(config.rabbitMQQueue, { durable: true });

        // Consume messages from the order queue on buy
        channel.consume(config.rabbitMQQueue, async (message) => {
          try {
            const order = JSON.parse(message.content.toString());
            const orderService = new OrderService();
            await orderService.createOrder(order);
            channel.ack(message);
          } catch (error) {
            console.error('Error processing message:', error);
            channel.reject(message, false);
          }
        });
        
        console.log('Order consumer ready and listening');
        
        // Handle connection close to attempt reconnect
        connection.on('close', () => {
          console.log('RabbitMQ connection closed. Attempting to reconnect...');
          setTimeout(() => MessageBroker.connectWithRetry(1), baseDelay);
        });
      })
      .catch((error) => {
        const delay = Math.min(baseDelay * attempt, maxDelay);
        console.error(`RabbitMQ connection failed (attempt ${attempt}/${maxRetries}):`, error.message);
        
        if (attempt < maxRetries) {
          console.log(`Retrying in ${delay / 1000} seconds...`);
          setTimeout(() => MessageBroker.connectWithRetry(attempt + 1), delay);
        } else {
          console.error('Max RabbitMQ connection attempts reached. Will continue retrying every 30 seconds.');
          setTimeout(() => MessageBroker.connectWithRetry(1), maxDelay);
        }
      });
  }
}

module.exports = MessageBroker;
