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

  // Middleware для проверки роли админа
  const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ только для администраторов' });
    }
    next();
  };

  // Оформление заказа
  router.post('/', async (req, res) => {
    try {
      console.log('Запрос на оформление заказа:', req.body);
      const token = req.user;
      const { items } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Корзина пуста' });
      }

      // Проверка остатков перед оформлением
      for (const item of items) {
        const productResult = await pool.query(
          'SELECT quantity FROM products WHERE id = $1',
          [item.product_id]
        );
        const availableQuantity = productResult.rows[0]?.quantity || 0;
        if (availableQuantity < item.quantity) {
          return res.status(400).json({ 
            message: `Недостаточно пива "${item.name || 'неизвестный продукт'}" в наличии. Остаток: ${availableQuantity}` 
          });
        }
      }

      const totalPrice = items.reduce((total, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price.split('₽')[0]) : parseFloat(item.price);
        return total + price * item.quantity;
      }, 0);

      // Создание заказа
      const orderResult = await pool.query(
        'INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING *',
        [token.id, totalPrice, 'pending']
      );
      const orderId = orderResult.rows[0].id;

      // Добавление элементов заказа и вычитание остатков
      for (const item of items) {
        const price = typeof item.price === 'string' ? parseFloat(item.price.split('₽')[0]) : parseFloat(item.price);
        await pool.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_order) VALUES ($1, $2, $3, $4)',
          [orderId, item.product_id, item.quantity, price]
        );
        // Вычитание остатка
        await pool.query(
          'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // Очистка корзины
      await pool.query('DELETE FROM cart WHERE user_id = $1', [token.id]);

      console.log('Заказ оформлен:', orderResult.rows[0]);
      res.status(201).json({ message: 'Заказ успешно оформлен', order: orderResult.rows[0] });
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Получение заказов пользователя
  router.get('/', async (req, res) => {
    try {
      console.log('Запрос заказов для user_id:', req.user.id);
      const token = req.user;
      const result = await pool.query(
        `SELECT o.id, o.total_price, o.created_at, o.status,
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
         GROUP BY o.id, o.total_price, o.created_at, o.status
         ORDER BY o.created_at DESC`,
        [token.id]
      );
      console.log('Результат заказов:', result.rows);
      res.json(result.rows);
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Получение всех заказов (только для админа)
  router.get('/all', checkAdmin, async (req, res) => {
    try {
      console.log('Запрос всех заказов для админа:', req.user.id);
      const result = await pool.query(
        `SELECT o.id, o.user_id, o.total_price, o.created_at, o.status,
                u.organization_name,
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
         LEFT JOIN users u ON o.user_id = u.id
         GROUP BY o.id, o.user_id, o.total_price, o.created_at, o.status
         ORDER BY o.created_at DESC`
      );
      console.log('Результат всех заказов:', result.rows);
      res.json(result.rows);
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Обновление статуса заказа (только для админа)
  router.put('/:orderId/status', checkAdmin, async (req, res) => {
    try {
      console.log('Обновление статуса заказа:', req.params.orderId, req.body);
      const { orderId } = req.params;
      const { status } = req.body;

      if (!['pending', 'shipped', 'delivered', 'canceled'].includes(status)) {
        return res.status(400).json({ message: 'Недопустимый статус' });
      }

      const result = await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, orderId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Заказ не найден' });
      }

      console.log('Статус обновлён:', result.rows[0]);
      res.json({ message: 'Статус заказа обновлён', order: result.rows[0] });
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};