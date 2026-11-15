require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Prometheus metrics ───────────────────────────────────────────────────────
const promClient = require('prom-client')
const collectDefaultMetrics = promClient.collectDefaultMetrics
collectDefaultMetrics({ prefix: 'stockease_' })

const httpRequestCounter = new promClient.Counter({
  name: 'stockease_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
})

const httpRequestDuration = new promClient.Histogram({
  name: 'stockease_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]
})

const activeRequestsGauge = new promClient.Gauge({
  name: 'stockease_active_requests',
  help: 'Number of active HTTP requests'
})

app.use((req, res, next) => {
  if (req.path === '/metrics') return next()
  activeRequestsGauge.inc()
  const end = httpRequestDuration.startTimer()
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path
    const labels = { method: req.method, route, status_code: res.statusCode }
    httpRequestCounter.inc(labels)
    end(labels)
    activeRequestsGauge.dec()
  })
  next()
})

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType)
    res.end(await promClient.register.metrics())
  } catch (err) {
    res.status(500).end(err.message)
  }
})
// ── End Prometheus metrics ───────────────────────────────────────────────────

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'StockEase API is running.' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start server only after MongoDB connects successfully
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`StockEase API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
