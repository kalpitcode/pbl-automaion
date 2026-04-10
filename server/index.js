const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());

// CORS — allow Vercel frontend + localhost for dev
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

// Add production frontend URL if set
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    return callback(null, true); // permissive for now — tighten in production
  },
  credentials: true,
}));

app.use(express.json({ limit: '20mb' }));

// Basic rate limiter (high limit for development)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Very high limit for dev avoiding 429s
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'PBL API is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/groups', require('./routes/groups.js'));
app.use('/api/weeks', require('./routes/weeks.js'));
app.use('/api/supervisor', require('./routes/supervisor.js'));
app.use('/api/submissions', require('./routes/submissions.js'));
app.use('/api/grades', require('./routes/grading.js'));


const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`Server listening on ${HOST}:${PORT}`);
});
