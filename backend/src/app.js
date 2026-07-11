import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for local development, can restrict to frontend URL later
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Placeholder routes to prevent 404s on frontend during step-by-step dev
app.use('/api/transactions', (req, res) => {
  res.json([]);
});

app.use('/api/wallet', (req, res) => {
  res.json({ balance: 0.00, history: [] });
});

app.use('/api/users', (req, res) => {
  res.json({ profile: {} });
});

// Root check
app.get('/', (req, res) => {
  res.json({ message: 'Escrow API is running.' });
});

// Error handling
app.use(errorHandler);

export default app;
