const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const DATABASE_URL = require('DATABASE_URL')

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'https://beerbot-hazel.vercel.app' }));
app.use(express.json());
app.use('/images', express.static('public/images'));

// Подключение к PostgreSQL с использованием pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true,
  },
  family: 4,
});

pool.on('connect', () => {
  console.log('Successfully connected to PostgreSQL at', new Date().toISOString());
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err.stack);
});

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Маршруты
const productsRoutes = require('./src/routes/productsRoutes');
const authRoutes = require('./src/routes/authRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const ordersRoutes = require('./src/routes/ordersRoutes');

app.use('/api/products', authenticateToken, productsRoutes(pool));
app.use('/api/auth', authRoutes(pool));
app.use('/api/cart', authenticateToken, cartRoutes(pool));
app.use('/api/orders', authenticateToken, ordersRoutes(pool));

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} at`, new Date().toISOString()));