const amqp = require("amqplib");
const config = require("../config");

class MessageBroker {
  constructor() {
    this.channel = null;
    this.connectionPromise = null;
  }

  async waitForChannel() {
    // If channel is already available, return immediately
    if (this.channel) {
      return this.channel;
    }

    // Wait for connection to complete
    if (this.connectionPromise) {
      await this.connectionPromise;
    }

    // Return the channel or throw error
    if (!this.channel) {
      throw new Error("Failed to establish RabbitMQ connection");
    }

    return this.channel;
  }

  async connect() {
    console.log("Connecting to RabbitMQ...");

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Start connection attempt in background, don't block app startup
    this.attemptConnection();
  }

  async attemptConnection(attempt = 1) {
    const maxRetries = 10;
    const baseDelay = 5000; // 5 seconds
    const maxDelay = 30000; // 30 seconds

    try {
      console.log(`RabbitMQ connection attempt ${attempt}/${maxRetries}...`);
      const connection = await amqp.connect(config.rabbitMQUrl);
      this.channel = await connection.createChannel();
      await this.channel.assertQueue("products");
      await this.channel.assertQueue("orders");
      console.log("RabbitMQ connected successfully");

      // Handle connection close to attempt reconnect
      connection.on('close', () => {
        console.log('RabbitMQ connection closed. Attempting to reconnect...');
        this.channel = null;
        setTimeout(() => this.attemptConnection(1), baseDelay);
      });
      return;
    } catch (err) {
      const delay = Math.min(baseDelay * attempt, maxDelay);
      console.error(`Connection attempt ${attempt} failed:`, err.message);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        setTimeout(() => this.attemptConnection(attempt + 1), delay);
      } else {
        console.error("Max RabbitMQ connection attempts reached. Will continue retrying every 30 seconds.");
        setTimeout(() => this.attemptConnection(1), maxDelay);
      }
    }
  }

  async publishMessage(queue, message) {
    try {
      const channel = await this.waitForChannel();
      await channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message))
      );
      console.log(`Message published to ${queue}`);
    } catch (err) {
      console.error("Error publishing message:", err.message);
      throw err;
    }
  }

  async consumeMessage(queue, callback) {
    try {
      const channel = await this.waitForChannel();
      await channel.consume(queue, (message) => {
        const content = message.content.toString();
        const parsedContent = JSON.parse(content);
        callback(parsedContent);
        channel.ack(message);
      });
      console.log(`Consuming messages from ${queue}`);
    } catch (err) {
      console.error("Error consuming message:", err.message);
      throw err;
    }
  }
}

module.exports = new MessageBroker();
