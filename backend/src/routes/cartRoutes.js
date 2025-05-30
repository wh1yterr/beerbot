// src/routes/cartRoutes.js
const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Middleware для проверки токена
  router.use((req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Доступ запрещён' });

    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Недействительный токен' });
      req.user = user;
      next();
    });
  });

  // Получение товаров из корзины
  router.get('/', async (req, res) => {
    try {
      const token = req.user;
      const result = await pool.query(
        `SELECT c.id, c.quantity, p.id AS product_id, p.name, p.description, p.price, p.image
         FROM cart c 
         JOIN products p ON c.product_id = p.id 
         WHERE c.user_id = $1`,
        [token.id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Добавление товара в корзину
  router.post('/', async (req, res) => {
    try {
      const token = req.user;
      const { productId, quantity = 1 } = req.body; // quantity по умолчанию 1
      const result = await pool.query(
        `INSERT INTO cart (user_id, product_id, quantity) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (user_id, product_id) 
         DO UPDATE SET quantity = cart.quantity + $3 
         RETURNING *`,
        [token.id, productId, quantity]
      );
      res.status(201).json({ message: 'Товар добавлен в корзину', item: result.rows[0] });
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Удаление товара из корзины
  router.delete('/:id', async (req, res) => {
    try {
      const token = req.user;
      const { id } = req.params;
      await pool.query(
        'DELETE FROM cart WHERE id = $1 AND user_id = $2',
        [id, token.id]
      );
      res.json({ message: 'Товар удалён из корзины' });
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};