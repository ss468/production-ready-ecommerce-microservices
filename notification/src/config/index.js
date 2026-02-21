require('dotenv').config();

const config = {
  rabbitMQUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  rabbitMQQueue: 'orders',
  notificationQueue: 'notifications',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3000',
  
  // Email Configuration
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
  },

  port: process.env.PORT || 3004
};

console.log('[Notification Config] AUTH_SERVICE_URL:', config.authServiceUrl);
console.log('[Notification Config] RabbitMQ URL:', config.rabbitMQUrl);
console.log('[Notification Config] SMTP Host:', config.email.host);
console.log('[Notification Config] SMTP Port:', config.email.port);
console.log('[Notification Config] Email User:', config.email.user ? '✓ Set' : '✗ MISSING');
console.log('[Notification Config] Email Password:', config.email.password ? '✓ Set' : '✗ MISSING');

if (!config.email.user || !config.email.password) {
  console.error('[Notification Config] ⚠️  WARNING: Email credentials are not configured!');
  console.error('[Notification Config] Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
}

module.exports = config;
