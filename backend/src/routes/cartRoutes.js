const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Middleware для проверки токена
  router.use((req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
      req.user = user;
      next();
    });
  });

  // Получение товаров из корзины
  router.get('/', async (req, res) => {
    try {
      const token = req.user;
      const result = await pool.query(
        `SELECT p.id, p.name, p.type, p.alcohol 
         FROM cart c 
         JOIN products p ON c.product_id = p.id 
         WHERE c.user_id = $1`,
        [token.id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error in query:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Добавление товара в корзину
  router.post('/', async (req, res) => {
    try {
      const token = req.user;
      const { productId } = req.body;
      const result = await pool.query(
        'INSERT INTO cart (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
        [token.id, productId]
      );
      if (result.rowCount === 0) {
        return res.status(400).json({ message: 'Товар уже в корзине' });
      }
      res.status(201).json({ message: 'Товар добавлен в корзину' });
    } catch (err) {
      console.error('Error in query:', err.stack);
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
      res.json({ message: 'Товар удален из корзины' });
    } catch (err) {
      console.error('Error in query:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};