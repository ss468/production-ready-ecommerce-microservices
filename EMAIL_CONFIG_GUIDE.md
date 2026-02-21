# ✅ Email Configuration - Complete Setup Guide

## Current Status
✅ Email credentials are now being loaded from `notification/.env`  
✅ Configuration shows: Email User: ✓ Set, Email Password: ✓ Set  
✅ SMTP properly configured (smtp.gmail.com:587)  
✅ Ready to send emails

## What Was Fixed

### Problem
```
Error: Missing credentials for "PLAIN"
```
The docker-compose was trying to load email credentials from the host environment using `${EMAIL_USER}` and `${EMAIL_PASSWORD}`, which were blank.

### Solution
1. **Updated docker-compose.yml** - Removed environment variable substitution
2. **Now uses** `env_file: ./notification/.env` only
3. **Credentials are loaded** from the notification/.env file

## Configuration Details

### notification/.env
```env
# Your Gmail account with App Password
EMAIL_USER=srikanthjoshi96@gmail.com
EMAIL_PASSWORD=itrt souy rolz eiic

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### For Gmail Users (With 2FA Enabled)
1. Go to: https://myaccount.google.com/apppasswords
2. Select: "Mail" and "Windows Computer"
3. Generate 16-character password
4. Replace `EMAIL_PASSWORD` in `.env` with this password

### For Other Email Providers
Update accordingly:
- **Office 365**: smtp.office365.com:587
- **SendGrid**: smtp.sendgrid.net:587
- **Custom SMTP**: Set SMTP_HOST and SMTP_PORT

## Logging Output

When the service starts, you should see:
```
[Notification Config] SMTP Host: smtp.gmail.com
[Notification Config] SMTP Port: 587
[Notification Config] Email User: ✓ Set
[Notification Config] Email Password: ✓ Set
[Email Service] ✓ Email transporter initialized successfully
[Email Service] Using SMTP: smtp.gmail.com:587
```

## How to Test Email Sending

### Option 1: Place a Test Order
1. Open http://localhost:3003
2. Register/login
3. Add product to cart
4. Checkout to create order

### Option 2: Watch Logs
```bash
docker-compose logs notification -f
```

### Expected Success Output
```
[Notification] Attempting to fetch user email from: http://auth:3000/users/userId
[Notification] Successfully fetched user email: your-email@gmail.com
[Notification] Complete order object: {...}
[Email Service] Sending email to: your-email@gmail.com
Order confirmation email sent to your-email@gmail.com
Message acknowledged
```

### Expected Failure Output (Before Fix)
```
Error sending order confirmation email: Error: Missing credentials for "PLAIN"
Message rejected and requeued
```

## Docker Service Configuration

The notification service in docker-compose.yml now:
- ✅ Uses only `env_file: ./notification/.env`
- ✅ Sets `RABBITMQ_URL=amqp://rabbitmq:5672`
- ✅ Sets `AUTH_SERVICE_URL=http://auth:3000`
- ✅ Loads email credentials from .env file

## Updated notification/.env Configuration

```env
# RabbitMQ (Docker uses rabbitmq:5672, Local uses localhost:5672)
RABBITMQ_URL=amqp://rabbitmq:5672

# Auth Service (Docker uses auth:3000, Local uses localhost:3000)
AUTH_SERVICE_URL=http://auth:3000

# Email Configuration - UPDATE THESE WITH YOUR CREDENTIALS
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# SMTP Details
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# Port
PORT=3004
```

## Troubleshooting

### If you still see "Missing credentials" error:
1. Verify `.env` file has correct email credentials
2. Check credentials have no extra spaces
3. Rebuild Docker image: `docker-compose build notification`
4. Restart: `docker-compose up -d notification`
5. Check logs: `docker-compose logs notification -f`

### If email sends but credential error appears:
- This could be a connection issue, try:
  1. Verify internet connection
  2. Check Gmail allows "Less secure apps" or use App Password
  3. Verify SMTP_HOST and SMTP_PORT are correct

### If order is not triggering email:
1. Check notification service is running: `docker-compose ps`
2. Verify RabbitMQ has orders: Check `RABBITMQ_URL` is correct
3. Verify Auth service is accessible: `docker-compose logs auth`

## Files Modified

| File | Change |
|------|--------|
| `docker-compose.yml` | Removed hardcoded env vars, use env_file only |
| `notification/.env` | Added Docker-specific URLs |
| `notification/src/config/index.js` | Added credential validation logging |
| `notification/src/services/emailService.js` | Added credential check before initializing |

## Service Status After Fix

```bash
$ docker-compose logs notification | grep -E "Config|Email|SMTP"
[Notification Config] Email User: ✓ Set
[Notification Config] Email Password: ✓ Set
[Email Service] ✓ Email transporter initialized successfully
```

## Next Steps

1. ✅ Verify credentials are in `notification/.env`
2. ✅ Rebuild and restart: `docker-compose build notification && docker-compose up -d`
3. ✅ Place a test order
4. ✅ Check notification logs: `docker-compose logs notification -f`
5. ✅ Look for confirmation email

---

**Last Updated**: 2026-02-21  
**Status**: Email Configuration Ready ✅
