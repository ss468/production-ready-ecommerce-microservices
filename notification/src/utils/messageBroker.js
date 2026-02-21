const amqp = require('amqplib');
const config = require('../config');
const NotificationService = require('../services/notificationService');

class MessageBroker {
  static async connect() {
    MessageBroker.connectWithRetry();
  }

  static connectWithRetry(attempt = 1) {
    const maxRetries = 10;
    const baseDelay = 5000; // 5 seconds
    const maxDelay = 30000; // 30 seconds

    console.log(
      `Notification Service - RabbitMQ connection attempt ${attempt}/${maxRetries}...`
    );

    amqp.connect(config.rabbitMQUrl)
      .then(async (connection) => {
        console.log('Notification Service - Connected to RabbitMQ successfully');
        const channel = await connection.createChannel();

        // Declare the orders queue to listen for new orders
        await channel.assertQueue(config.rabbitMQQueue, { durable: true });
        console.log(
          `Notification Service - Listening to queue: ${config.rabbitMQQueue}`
        );

        // Consume messages from the orders queue
        channel.consume(config.rabbitMQQueue, async (message) => {
          try {
            console.log('Notification Service - Message received from orders queue');
            const orderData = JSON.parse(message.content.toString());
            console.log('Order data:', orderData);

            const notificationService = new NotificationService();
            const emailSent =
              await notificationService.handleOrderReceived(orderData);

            if (emailSent) {
              channel.ack(message);
              console.log('Message acknowledged');
            } else {
              // Reject and requeue if email sending failed
              channel.reject(message, true);
              console.log('Message rejected and requeued');
            }
          } catch (error) {
            console.error('Error processing message:', error);
            channel.reject(message, false);
          }
        });

        console.log('Notification Service - Consumer ready and listening');

        // Handle connection close to attempt reconnect
        connection.on('close', () => {
          console.log(
            'RabbitMQ connection closed. Attempting to reconnect...'
          );
          setTimeout(() => MessageBroker.connectWithRetry(1), baseDelay);
        });

        // Reset the error counter on successful connection
        MessageBroker.lastSuccessfulConnection = Date.now();
      })
      .catch((error) => {
        const delay = Math.min(baseDelay * attempt, maxDelay);
        console.error(
          `RabbitMQ connection failed (attempt ${attempt}/${maxRetries}):`,
          error.message
        );

        if (attempt < maxRetries) {
          console.log(`Retrying in ${delay / 1000} seconds...`);
          setTimeout(() => MessageBroker.connectWithRetry(attempt + 1), delay);
        } else {
          console.error(
            'Max RabbitMQ connection retries reached. Please check your RabbitMQ configuration.'
          );
        }
      });
  }
}

module.exports = MessageBroker;
