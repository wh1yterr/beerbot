// src/routes/ordersRoutes.js
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

  // Оформление заказа
  router.post('/', async (req, res) => {
    try {
      console.log('Запрос на оформление заказа:', req.body); // Логирование
      const token = req.user;
      const { items } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Корзина пуста' });
      }

      // Рассчитываем общую стоимость
      const totalPrice = items.reduce((total, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price.split('₽')[0]) : parseFloat(item.price);
        return total + price * item.quantity;
      }, 0);

      // Создаём заказ
      const orderResult = await pool.query(
        'INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING *',
        [token.id, totalPrice]
      );
      const orderId = orderResult.rows[0].id;

      // Сохраняем детали заказа в order_items
      for (const item of items) {
        const price = typeof item.price === 'string' ? parseFloat(item.price.split('₽')[0]) : parseFloat(item.price);
        await pool.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_order) VALUES ($1, $2, $3, $4)',
          [orderId, item.product_id, item.quantity, price]
        );
      }

      // Очищаем корзину
      await pool.query('DELETE FROM cart WHERE user_id = $1', [token.id]);

      console.log('Заказ оформлен:', orderResult.rows[0]); // Логирование
      res.status(201).json({ message: 'Заказ успешно оформлен', order: orderResult.rows[0] });
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Получение заказов пользователя
  router.get('/', async (req, res) => {
    try {
      console.log('Запрос заказов для user_id:', req.user.id); // Логирование
      const token = req.user;
      const result = await pool.query(
        `SELECT o.id, o.total_price, o.created_at, 
                json_agg(
                  json_build_object(
                    'product_id', oi.product_id,
                    'name', p.name,
                    'quantity', oi.quantity,
                    'price_at_order', oi.price_at_order
                  )
                ) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE o.user_id = $1
         GROUP BY o.id, o.total_price, o.created_at
         ORDER BY o.created_at DESC`,
        [token.id]
      );
      console.log('Результат заказов:', result.rows); // Логирование
      res.json(result.rows);
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};