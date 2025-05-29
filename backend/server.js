const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// Передаем pool в маршруты
const beersRoutes = require('./src/routes/beersRoutes')(pool);
app.use('/api/products', beersRoutes);

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));