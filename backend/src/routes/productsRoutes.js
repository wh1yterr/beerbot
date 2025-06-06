const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
  const router = express.Router();

  // Middleware для проверки токена
  router.use((req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Доступ запрещён' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Недействительный токен' });
      req.user = user;
      next();
    });
  });

  // Middleware для проверки роли админа
  const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ только для администраторов' });
    }
    next();
  };

  // Получить все продукты (только активные)
  router.get('/', async (req, res) => {
    try {
      console.log('Executing query: SELECT * FROM products WHERE is_deleted = FALSE');
      const result = await pool.query('SELECT * FROM products WHERE is_deleted = FALSE');
      console.log('Query result:', result.rows);
      res.json(result.rows);
    } catch (err) {
      console.error('Error in query:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Добавить новый продукт
  router.post('/', checkAdmin, async (req, res) => {
    const { name, description, image, price, quantity = 0 } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO products (name, description, image, price, quantity, is_deleted) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, description, image, price, quantity, false]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error in query:', err.stack);
      res.status(400).json({ message: err.message });
    }
  });

  // Обновить количество продукта
  router.put('/:productId/quantity', checkAdmin, async (req, res) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;

      if (quantity < 0) {
        return res.status(400).json({ message: 'Количество не может быть отрицательным' });
      }

      const result = await pool.query(
        'UPDATE products SET quantity = $1 WHERE id = $2 AND is_deleted = FALSE RETURNING *',
        [quantity, productId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Продукт не найден' });
      }

      res.json({ message: 'Количество обновлено', product: result.rows[0] });
    } catch (err) {
      console.error('Error in query:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Пометить продукт как удалённый
  router.delete('/:productId', checkAdmin, async (req, res) => {
    try {
      const { productId } = req.params;

      const result = await pool.query(
        'UPDATE products SET is_deleted = TRUE WHERE id = $1 RETURNING *',
        [productId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Продукт не найден' });
      }

      res.json({ message: 'Продукт помечен как удалённый', product: result.rows[0] });
    } catch (err) {
      console.error('Error in query:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Обновить информацию о продукте
  router.put('/:productId', checkAdmin, async (req, res) => {
    try {
      const { productId } = req.params;
      const { name, price } = req.body;

      if (price < 0) {
        return res.status(400).json({ message: 'Цена не может быть отрицательной' });
      }

      const result = await pool.query(
        'UPDATE products SET name = $1, price = $2 WHERE id = $3 AND is_deleted = FALSE RETURNING *',
        [name, price, productId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Продукт не найден' });
      }

      res.json({ message: 'Информация о продукте обновлена', product: result.rows[0] });
    } catch (err) {
      console.error('Error in query:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};