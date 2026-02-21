# Notification Service - Debugging & Testing Guide

## Issues Fixed

The notification service was getting a 404 error when trying to fetch user emails because:

1. **Missing Auth Endpoint**: Auth service didn't have a public endpoint to fetch users by ID
2. **Incorrect URL Path**: Was calling `/api/users/{userId}` instead of `/users/{userId}`
3. **Missing Configuration Logging**: Couldn't verify AUTH_SERVICE_URL was set correctly

## Changes Made

### 1. Auth Service ([auth/src/app.js](auth/src/app.js))
✅ Added new endpoint:
```javascript
GET /users/:id
```
This endpoint:
- Takes user ID as parameter
- Returns user email and ID
- Does NOT require authentication
- Used by notification service

### 2. Notification Service ([notification/src/services/notificationService.js](notification/src/services/notificationService.js))
✅ Updated to call correct endpoint:
```javascript
GET http://auth:3000/users/{userId}
```

### 3. Configuration Logging ([notification/src/config/index.js](notification/src/config/index.js))
✅ Added debug logging to verify:
- AUTH_SERVICE_URL is loaded correctly
- RabbitMQ URL is configured

## Current Status

✅ Auth Service: Running on port 3000
✅ Notification Service: Running on port 3004
✅ Configuration: Properly loaded with:
  - AUTH_SERVICE_URL=http://auth:3000 (Docker) or http://localhost:3000 (Local)
  - RABBITMQ_URL=amqp://rabbitmq:5672

## How to Verify It's Working

### Option 1: Monitor Logs in Real-Time

```bash
# Terminal 1: Watch Auth service logs
docker-compose logs auth -f

# Terminal 2: Watch Notification service logs
docker-compose logs notification -f

# Terminal 3: Create an order at http://localhost:3003
```

Watch for these log messages:

**Auth Service:**
```
[Auth Service] GET /users/:id called with userId: 6998f6680bfcc1b5e9ccb99d
[Auth Service] User found: userexample@gmail.com
[Auth Service] Successfully returning user email: userexample@gmail.com
```

**Notification Service:**
```
[Notification] Attempting to fetch user email from: http://auth:3000/users/6998f6680bfcc1b5e9ccb99d
[Notification] Successfully fetched user email: userexample@gmail.com
Order confirmation email sent to userexample@gmail.com
Message acknowledged
```

### Option 2: Test with Existing Orders

If there are orders in the RabbitMQ queue, they will be processed and users should receive emails.

### Option 3: Manual API Test

Test if Auth endpoint is responding:

```bash
# Using PowerShell
$userId = "6998f6680bfcc1b5e9ccb99d"  # Replace with actual user ID from DB
$response = Invoke-WebRequest -Uri "http://localhost:3000/users/$userId" -Method GET
$response.Content | ConvertFrom-Json
```

Expected response:
```json
{
  "email": "user@example.com",
  "id": "6998f6680bfcc1b5e9ccb99d"
}
```

## Docker Commands for Debugging

```bash
# Check all containers are running
docker-compose ps

# View recent logs
docker-compose logs auth -n 50
docker-compose logs notification -n 50
docker-compose logs order -n 50

# Follow logs in real-time
docker-compose logs auth -f
docker-compose logs notification -f

# Restart individual services
docker-compose restart auth
docker-compose restart notification

# Rebuild and restart
docker-compose build auth notification
docker-compose up -d
```

## Email Configuration

Make sure your `.env` file has email credentials:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

For Gmail with 2FA:
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the 16-character password
4. Update `.env` with this password

## Expected Email Flow

1. **User places order** →
2. **Product service publishes to RabbitMQ** (orders queue) →
3. **Order service saves to DB** →
4. **Notification service receives message** →
5. **Looks up user email from Auth service** →
6. **Sends confirmation email via nodemailer** →
7. **Acknowledges message in RabbitMQ** ✅

## Troubleshooting Checklist

- [ ] Both Auth and Notification services are running
- [ ] Docker containers have network connectivity
- [ ] RabbitMQ is accessible from both services
- [ ] Auth endpoint `/users/:id` returns user email
- [ ] Email credentials are valid in `.env`
- [ ] MongoDB has users with valid email addresses
- [ ] Orders in RabbitMQ have valid userId references

## Next Steps

Once working, you can:
1. Monitor email delivery in logs
2. Add email sent status tracking
3. Implement order status update emails
4. Add SMS notifications (optional)
5. Set up email templates with custom branding
