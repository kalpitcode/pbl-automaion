const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

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
  res.status(200).json({ status: 'OK', message: 'Auth API is working' });
});

// Routes
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/groups', require('./routes/groups.js'));
app.use('/api/weeks', require('./routes/weeks.js'));
app.use('/api/supervisor', require('./routes/supervisor.js'));
app.use('/api/submissions', require('./routes/submissions.js'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
