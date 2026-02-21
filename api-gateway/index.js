const express = require("express");
const cors = require("cors");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: false
});
const app = express();

// Enable CORS with detailed configuration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
}));

// Handle preflight requests
app.options("*", cors());

// Health check endpoint - Gateway itself
app.get('/health', (req, res) => {
  console.log('Gateway health check');
  res.json({ status: 'API Gateway is healthy', timestamp: new Date().toISOString() });
});

// Error handling for proxy
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.status(500).json({ error: 'Proxy error', message: err.message });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway is running' });
});

// Route requests to the auth service
app.use("/auth", (req, res) => {
  console.log('Proxying to auth service:', req.method, req.path);
  proxy.web(req, res, { target: "http://auth:3000" });
});

// Route requests to the product service
app.use("/products", (req, res) => {
  console.log('Proxying to product service:', req.method, req.path);
  proxy.web(req, res, { target: "http://product:3001" });
});

// Route requests to the order service
app.use("/orders", (req, res) => {
  console.log('Proxying to order service:', req.method, req.path);
  proxy.web(req, res, { target: "http://order:3002" });
});

// Start the server
const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});
