# Notification Service

A microservice that sends order confirmation and status update emails to customers using nodemailer.

## Features

- Listens to order events from RabbitMQ
- Sends order confirmation emails when new orders are received
- Sends order status update emails (processing, shipped, delivered, cancelled)
- Robust email templates with order details
- Auto-retry on failure
- RabbitMQ connection with exponential backoff retry

## Prerequisites

- Node.js 14+
- RabbitMQ running and accessible
- SMTP credentials (Gmail, SendGrid, or custom SMTP server)

## Setup

### 1. Configure Email Credentials

Edit the `.env` file with your email service credentials:

```env
# Using Gmail (recommended with App Password)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Or use custom SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 2. Gmail Setup (recommended)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use the 16-character password in `EMAIL_PASSWORD`

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Service

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

### 5. With Docker Compose

The service is configured in `docker-compose.yml`:

```bash
docker-compose up notification
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| RABBITMQ_URL | RabbitMQ connection URL | amqp://localhost:5672 |
| EMAIL_SERVICE | Email service provider | gmail |
| EMAIL_USER | Email account username | - |
| EMAIL_PASSWORD | Email account password/app-password | - |
| SMTP_HOST | SMTP server host | smtp.gmail.com |
| SMTP_PORT | SMTP server port | 587 |
| SMTP_SECURE | Use TLS for SMTP | false |
| AUTH_SERVICE_URL | Auth service URL for getting user emails | http://localhost:3000 |
| PORT | Service port | 3004 |

## API Endpoints

- `GET /` - Service info
- `GET /health` - Health check

## Message Format

The service listens to the "orders" queue and expects messages in the following format:

```json
{
  "_id": "order-id",
  "user": "user-id",
  "products": [
    {
      "_id": "product-id",
      "name": "Product Name",
      "description": "Product Description",
      "price": 29.99
    }
  ],
  "totalPrice": 29.99,
  "status": "created",
  "createdAt": "2024-01-20T10:30:00Z"
}
```

## How It Works

1. When an order is placed, it's published to the RabbitMQ "orders" queue
2. The notification service consumes the message
3. It fetches the user's email from the Auth service
4. Sends a formatted HTML email with order details
5. Acknowledges the message in RabbitMQ

## Email Templates

### Order Confirmation
- Sent immediately when order is received
- Includes order ID, items, prices, and total amount

### Order Status Update
- Sent when order status changes (processing, shipped, delivered, cancelled)
- Custom messages based on status

## Error Handling

- Automatic retry on email sending failure (message requeued in RabbitMQ)
- RabbitMQ connection failures trigger exponential backoff retry (up to 10 attempts)
- Failed user lookups skip email sending but don't fail the process

## Troubleshooting

### Emails not sending
1. Check email credentials in `.env`
2. Verify SMTP server settings
3. Check firewall/network connectivity to SMTP server
4. Look for logs: `Error sending order confirmation email`

### RabbitMQ connection issues
1. Verify RabbitMQ is running: `docker ps | grep rabbitmq`
2. Check connection URL in `.env`
3. Look for logs: `RabbitMQ connection failed`

### User email not found
1. Verify Auth service is running and accessible
2. Check AUTH_SERVICE_URL in `.env`
3. Ensure user ID in order message is valid

## Service Status

To check if the service is running:

```bash
curl http://localhost:3004/health
```

Expected response:
```json
{
  "status": "Notification Service is running",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## Testing

Send a test order message to RabbitMQ:

```javascript
const amqp = require('amqplib');

async function sendTestOrder() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  
  await channel.assertQueue('orders');
  
  const testOrder = {
    _id: 'test-order-123',
    user: 'user-123',
    products: [
      {
        _id: 'prod-1',
        name: 'Test Product',
        price: 29.99
      }
    ],
    totalPrice: 29.99,
    status: 'created',
    createdAt: new Date()
  };
  
  channel.sendToQueue('orders', Buffer.from(JSON.stringify(testOrder)));
  console.log('Test order sent!');
  
  await channel.close();
  await connection.close();
}

sendTestOrder();
```

## License

ISC
