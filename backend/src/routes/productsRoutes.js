// src/routes/productsRoutes.js
const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // Получить все продукты
    router.get('/', async (req, res) => {
        try {
            console.log('Executing query: SELECT * FROM products');
            const result = await pool.query('SELECT * FROM products');
            console.log('Query result:', result.rows);
            res.json(result.rows);
        } catch (err) {
            console.error('Error in query:', err.stack);
            res.status(500).json({ message: err.message });
        }
    });

    // Добавить новый продукт
    router.post('/', async (req, res) => {
        const { name, type, alcohol, description, image, price } = req.body;
        try {
            const result = await pool.query(
                'INSERT INTO products (name, type, alcohol, description, image, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [name, type, alcohol, description, image, price]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Error in query:', err.stack);
            res.status(400).json({ message: err.message });
        }
    });

    return router;
};