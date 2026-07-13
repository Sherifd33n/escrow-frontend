import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
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
app.use('/api/users', usersRoutes);

// Placeholder routes to prevent 404s on frontend during step-by-step dev
app.use('/api/transactions', (req, res) => {
  res.json([]);
});

app.use('/api/wallet', (req, res) => {
  res.json({ balance: 0.00, history: [] });
});

// Root check
app.get('/', (req, res) => {
  res.json({ message: 'Escrow API is running.' });
});

// Error handling
app.use(errorHandler);

export default app;
