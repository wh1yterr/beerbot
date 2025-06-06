const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Настройка CORS
const corsOptions = {
  origin: ['https://beerbotfronty.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 часа
};

app.use(cors(corsOptions));

// Обработка preflight запросов
app.options('*', cors(corsOptions));

app.use(express.json());
app.use('/images', express.static('public/images'));

// Подключение к PostgreSQL с использованием pg
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
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
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Маршруты
const productsRoutes = require('./src/routes/productsRoutes');
const authRoutes = require('./src/routes/authRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const ordersRoutes = require('./src/routes/ordersRoutes');

// Базовые маршруты без аутентификации
app.use('/api/auth', authRoutes(pool));
app.use('/api/orders', ordersRoutes(pool));

// Защищенные маршруты с аутентификацией
app.use('/api/products', authenticateToken, productsRoutes(pool));
app.use('/api/cart', authenticateToken, cartRoutes(pool));

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} at`, new Date().toISOString()));