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
        `SELECT c.id, c.quantity, p.id AS product_id, p.name, p.description, p.price, p.image, p.quantity AS available_quantity
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
      const { productId, quantity = 1 } = req.body;

      // Проверка остатка перед добавлением
      const productResult = await pool.query(
        'SELECT quantity FROM products WHERE id = $1',
        [productId]
      );
      const availableQuantity = productResult.rows[0]?.quantity || 0;
      const currentCartResult = await pool.query(
        'SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2',
        [token.id, productId]
      );
      const currentQuantity = currentCartResult.rows[0]?.quantity || 0;
      const newQuantity = currentQuantity + quantity;

      if (availableQuantity < newQuantity) {
        return res.status(400).json({ 
          message: `Недостаточно пива в наличии. Остаток: ${availableQuantity}` 
        });
      }

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

  // Обновление количества товара в корзине
  router.put('/:cartItemId/quantity', async (req, res) => {
    try {
      const token = req.user;
      const { cartItemId } = req.params;
      const { quantity } = req.body;

      const parsedQuantity = parseInt(quantity) || 0;
      if (parsedQuantity < 1) {
        return res.status(400).json({ message: 'Количество должно быть больше 0' });
      }

      // Проверка остатка
      const cartItemResult = await pool.query(
        'SELECT product_id FROM cart WHERE id = $1 AND user_id = $2',
        [cartItemId, token.id]
      );
      if (cartItemResult.rowCount === 0) {
        return res.status(404).json({ message: 'Товар в корзине не найден' });
      }

      const productId = cartItemResult.rows[0].product_id;
      const productResult = await pool.query(
        'SELECT quantity FROM products WHERE id = $1',
        [productId]
      );
      const availableQuantity = productResult.rows[0]?.quantity || 0;

      if (parsedQuantity > availableQuantity) {
        return res.status(400).json({ 
          message: `Недостаточно пива в наличии. Остаток: ${availableQuantity}` 
        });
      }

      const result = await pool.query(
        'UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [parsedQuantity, cartItemId, token.id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Товар в корзине не найден' });
      }

      res.json({ message: 'Количество обновлено', item: result.rows[0] });
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Удаление товара из корзины
  router.delete('/:cartItemId', async (req, res) => {
    try {
      const token = req.user;
      const { cartItemId } = req.params;
      await pool.query(
        'DELETE FROM cart WHERE id = $1 AND user_id = $2',
        [cartItemId, token.id]
      );
      res.json({ message: 'Товар удалён из корзины' });
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};