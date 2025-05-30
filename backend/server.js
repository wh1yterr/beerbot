const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'https://beerbot-hazel.vercel.app' }));
app.use(express.json());
app.use('/images', express.static('public/images'));

// Подключение к PostgreSQL с использованием DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Игнорировать самоподписанные сертификаты для теста
    require: true, // Требовать SSL
  },
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
const productsRoutes = require('./src/routes/productsRoutes')(pool);
const authRoutes = require('./src/routes/authRoutes')(pool);
const cartRoutes = require('./src/routes/cartRoutes')(pool);
const ordersRoutes = require('./src/routes/ordersRoutes')(pool);

app.use('/api/products', authenticateToken, productsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', authenticateToken, cartRoutes);
app.use('/api/orders', authenticateToken, ordersRoutes);

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} at`, new Date().toISOString()));