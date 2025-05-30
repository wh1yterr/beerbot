import express from 'express';
import postgres from 'postgres';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'https://beerbot-hazel.vercel.app' }));
app.use(express.json());
app.use('/images', express.static('public/images'));

// Подключение к PostgreSQL с использованием postgres.js
const sql = postgres(process.env.DATABASE_URL, {
  ssl: {
    rejectUnauthorized: false, // Игнорировать самоподписанные сертификаты для теста
    require: true, // Требовать SSL
  },
  family: 4, // Принудительное использование IPv4
});

sql.on('connect', () => {
  console.log('Successfully connected to PostgreSQL at', new Date().toISOString());
});

sql.on('error', (err) => {
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
import productsRoutes from './src/routes/productsRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import ordersRoutes from './src/routes/ordersRoutes.js';

app.use('/api/products', authenticateToken, productsRoutes(sql));
app.use('/api/auth', authRoutes(sql));
app.use('/api/cart', authenticateToken, cartRoutes(sql));
app.use('/api/orders', authenticateToken, ordersRoutes(sql));

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} at`, new Date().toISOString()));