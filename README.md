# 🛒 production-ready-ecommerce-microservices

A scalable E-commerce backend system .  
This project demonstrates synchronous and asynchronous service communication using **RabbitMQ**, API Gateway routing, Docker orchestration, and modular backend design.

---

## 🚀 Tech Stack

- Node.js
- Express.js
- MongoDB
- RabbitMQ (Asynchronous Messaging)
- Docker & Docker Compose
- REST APIs
- Microservices Architecture

---

## 🏗️ Architecture Overview

This project follows a **Microservices Architecture** pattern with both:

- 🔁 **Synchronous communication** (HTTP REST APIs)
- 📩 **Asynchronous communication** (RabbitMQ Message Queue)

### Services Included:

- 🔐 **Auth Service** – User authentication & JWT handling
- 📦 **Product Service** – Product management
- 🛒 **Order Service** – Order processing
- 🔔 **Notification Service** – Consumes events via RabbitMQ for email notifications
- 🌐 **API Gateway** – Centralized request routing
- 🐇 **RabbitMQ Broker** – Handles async message-based communication
- 💻 **Frontend** – React-based UI (if applicable)

Each service runs independently and communicates either via REST or message queues.

---

## 📡 Asynchronous Flow (RabbitMQ)

When an order is placed:

1. Order Service processes the order.
2. It publishes an event to RabbitMQ.
3. Notification Service consumes the event.
4. Email is sent asynchronously.

This ensures:
- Loose coupling between services
- Better scalability
- Improved system reliability
- Non-blocking operations

---

## 📂 Project Structure

```
nodejs-ecommerce-microservices/
│
├── api-gateway/
├── auth/
├── product/
├── order/
├── notification/
├── utils/
├── docker-compose.yml
└── package.json
```

---

## 🐳 Running with Docker (Recommended)

Make sure Docker is installed.

### 1️⃣ Build and start all services

```bash
docker-compose up --build
```

### 2️⃣ Stop all services

```bash
docker-compose down
```

---

## ⚙️ Running Manually (Without Docker)

For each service:

```bash
cd service-folder
npm install
npm start
```

Make sure:
- MongoDB is running
- RabbitMQ is running
- Environment variables are configured

---

## 🔐 Environment Variables

Example:

```
PORT=4000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
RABBITMQ_URL=amqp://localhost
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

---

## 📌 Features

- User Registration & Login (JWT Authentication)
- Product CRUD operations
- Order placement
- Event-driven email notifications (RabbitMQ)
- Centralized API Gateway
- Dockerized deployment
- Synchronous + Asynchronous communication
- Clean service separation

---

## 📈 Key Learning Outcomes

- Designing Microservices Architecture
- Implementing API Gateway
- Event-Driven Architecture using RabbitMQ
- Service decoupling with message queues
- Docker containerization
- Building scalable backend systems

---

## 🧠 Future Improvements

- Add Redis for caching
- Implement Saga pattern
- Add distributed logging
- Add CI/CD pipeline
- Deploy to AWS / Kubernetes

---

## 👨‍💻 Author

**Srikanth Joshi**

---

⭐ If you found this project useful, consider giving it a star!
