const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/images', express.static('public/images'));

// Подключение к PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('Successfully connected to PostgreSQL');
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
const cartRoutes = require('./src/routes/cartRoutes')(pool); // Добавьте эту строку
const ordersRoutes = require('./src/routes/ordersRoutes')(pool); // Подключение ordersRoutes

app.use('/api/products', authenticateToken, productsRoutes); // Защищенные маршруты
app.use('/api/auth', authRoutes); // Маршруты для аутентификации
app.use('/api/cart', authenticateToken, cartRoutes); // Добавьте эту строку
app.use('/api/orders', authenticateToken, ordersRoutes); // Маршрут для заказов

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));