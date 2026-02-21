const axios = require('axios');
const EmailService = require('./emailService');
const config = require('../config');

class NotificationService {
  constructor() {
    this.emailService = new EmailService();
  }

  async getUserEmail(userId) {
    try {
      const url = `${config.authServiceUrl}/users/${userId}`;
      console.log(`[Notification] Attempting to fetch user email from: ${url}`);
      
      // Call auth service to get user details
      const response = await axios.get(url, {
        timeout: 5000,
      });
      
      console.log(`[Notification] Successfully fetched user email: ${response.data.email}`);
      return response.data.email;
    } catch (error) {
      console.error(`[Notification] Failed to fetch user email:`, error.response?.status, error.message);
      if (error.response) {
        console.error(`[Notification] Response data:`, error.response.data);
      }
      return null;
    }
  }

  async handleOrderReceived(orderData) {
    try {
      console.log('Processing order notification:', orderData);

      const { userId, orderId, products } = orderData;

      if (!userId) {
        console.error('No userId provided in order data');
        return false;
      }

      // Get user email
      const userEmail = await this.getUserEmail(userId);

      if (!userEmail) {
        console.error('Could not get user email for userId:', userId);
        return false;
      }

      console.log(`Sending order confirmation to ${userEmail}`);

      // Calculate total price
      const totalPrice = products.reduce((sum, product) => sum + (product.price || 0), 0);

      // Prepare complete order object for email service
      const completeOrder = {
        _id: orderId,
        products: products,
        userId: userId,
        totalPrice: totalPrice,
        status: orderData.status || 'pending',
        createdAt: orderData.createdAt || new Date(),
      };

      console.log(`[Notification] Complete order object:`, completeOrder);

      // Send confirmation email
      const emailSent = await this.emailService.sendOrderConfirmationEmail(
        userEmail,
        completeOrder
      );

      if (emailSent) {
        console.log(`Order confirmation email sent to ${userEmail}`);
        return true;
      } else {
        console.error('Failed to send order confirmation email');
        return false;
      }
    } catch (error) {
      console.error('Error handling order received:', error);
      return false;
    }
  }

  async handleOrderStatusUpdate(orderData, newStatus) {
    try {
      console.log(
        'Processing order status update notification:',
        orderData._id,
        newStatus
      );

      const { user: userId } = orderData;

      if (!userId) {
        console.error('No userId provided in order data');
        return false;
      }

      // Get user email
      const userEmail = await this.getUserEmail(userId);

      if (!userEmail) {
        console.error('Could not get user email for userId:', userId);
        return false;
      }

      console.log(`Sending order status update to ${userEmail}`);

      // Send status update email
      const emailSent = await this.emailService.sendOrderStatusUpdateEmail(
        userEmail,
        orderData,
        newStatus
      );

      if (emailSent) {
        console.log(`Order status update email sent to ${userEmail}`);
        return true;
      } else {
        console.error('Failed to send order status update email');
        return false;
      }
    } catch (error) {
      console.error('Error handling order status update:', error);
      return false;
    }
  }
}

module.exports = NotificationService;
