const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Validate required configuration
      if (!config.email.user || !config.email.password) {
        console.error('[Email Service] ✗ CRITICAL: Email credentials not configured!');
        console.error('[Email Service] EMAIL_USER:', config.email.user ? '✓' : '✗ MISSING');
        console.error('[Email Service] EMAIL_PASSWORD:', config.email.password ? '✓' : '✗ MISSING');
        console.error('[Email Service] Please update .env file with valid email credentials');
        this.transporter = null;
        return;
      }

      // Create transporter using environment variables
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });

      console.log('[Email Service] ✓ Email transporter initialized successfully');
      console.log('[Email Service] Using SMTP:', config.email.host + ':' + config.email.port);
    } catch (error) {
      console.error('[Email Service] Failed to initialize email transporter:', error);
      this.transporter = null;
    }
  }

  async sendOrderConfirmationEmail(userEmail, order) {
    try {
      if (!this.transporter) {
        console.error('Email transporter not initialized');
        return false;
      }

      // Validate order object has required fields
      if (!order.products || !Array.isArray(order.products)) {
        console.error('Invalid order data: missing or invalid products array');
        return false;
      }

      if (typeof order.totalPrice !== 'number' || order.totalPrice < 0) {
        console.error('Invalid order data: totalPrice is not a valid number');
        return false;
      }

      const productsList = order.products
        .map(
          (product) =>
            `<li>${product.name} - $${(product.price || 0).toFixed(2)} (Qty: 1)</li>`
        )
        .join('');

      const mailOptions = {
        from: config.email.user,
        to: userEmail,
        subject: 'Order Confirmation - Thank You for Your Purchase!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Order Confirmation</h2>
            <p>Dear Customer,</p>
            <p>Thank you for your order! We have received your purchase and it's being processed.</p>
            
            <h3 style="color: #555; margin-top: 20px;">Order Details:</h3>
            <p><strong>Order ID:</strong> ${order._id || 'N/A'}</p>
            <p><strong>Order Date:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">${order.status || 'pending'}</span></p>
            
            <h3 style="color: #555; margin-top: 20px;">Items Ordered:</h3>
            <ul style="border-left: 4px solid #4CAF50; padding-left: 20px;">
              ${productsList}
            </ul>
            
            <h3 style="color: #555; margin-top: 20px;">Order Summary:</h3>
            <p style="font-size: 18px;">
              <strong>Total Amount:</strong> 
              <span style="color: #4CAF50; font-size: 24px;">$${order.totalPrice.toFixed(2)}</span>
            </p>
            
            <p style="margin-top: 30px; color: #888; font-size: 12px;">
              We will notify you when your order is shipped. If you have any questions, please contact our support team.
            </p>
            
            <p style="margin-top: 20px; color: #555;">
              Best regards,<br>
              <strong>E-Commerce Team</strong>
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent:', info.response);
      return true;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return false;
    }
  }

  async sendOrderStatusUpdateEmail(userEmail, order, newStatus) {
    try {
      if (!this.transporter) {
        console.error('Email transporter not initialized');
        return false;
      }

      const statusMessages = {
        processing: 'Your order is being processed and will be shipped soon.',
        shipped: 'Your order has been shipped! Track your package using the tracking number provided.',
        delivered: 'Your order has been delivered. Thank you for your purchase!',
        cancelled: 'Your order has been cancelled. Please contact support if you have any questions.',
      };

      const mailOptions = {
        from: config.email.user,
        to: userEmail,
        subject: `Order Status Update - Order #${order._id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Order Status Update</h2>
            <p>Dear Customer,</p>
            <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
            
            <p style="margin-top: 20px;">
              <strong>Order ID:</strong> ${order._id}<br>
              <strong>New Status:</strong> <span style="color: #4CAF50; font-weight: bold;">${newStatus.toUpperCase()}</span>
            </p>
            
            <p style="margin-top: 30px; color: #888; font-size: 12px;">
              If you have any questions, please contact our support team.
            </p>
            
            <p style="margin-top: 20px; color: #555;">
              Best regards,<br>
              <strong>E-Commerce Team</strong>
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Order status update email sent:', info.response);
      return true;
    } catch (error) {
      console.error('Error sending order status update email:', error);
      return false;
    }
  }
}

module.exports = EmailService;
