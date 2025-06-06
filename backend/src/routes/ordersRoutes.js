const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = (pool) => {
  const router = express.Router();

  // Функция для генерации уникального 6-символьного кода
  const generateOrderCode = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase(); // Пример: "A1B2C3"
  };

  // Middleware для проверки токена
  const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Доступ запрещён' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Недействительный токен' });
      req.user = user;
      next();
    });
  };

  // Middleware для проверки роли админа
  const checkAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ только для администраторов' });
    }
    next();
  };

  // Оформление заказа
  router.post('/', authenticateToken, async (req, res) => {
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

      // Генерация уникального кода
      let orderCode = generateOrderCode();
      let existingOrder = await pool.query(
        'SELECT order_code FROM orders WHERE order_code = $1',
        [orderCode]
      );

      // Проверка уникальности кода
      while (existingOrder.rows.length > 0) {
        orderCode = generateOrderCode();
        existingOrder = await pool.query(
          'SELECT order_code FROM orders WHERE order_code = $1',
          [orderCode]
        );
      }

      // Создание заказа с order_code
      const orderResult = await pool.query(
        'INSERT INTO orders (user_id, total_price, status, order_code) VALUES ($1, $2, $3, $4) RETURNING *',
        [token.id, totalPrice, 'pending', orderCode]
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
      res.status(201).json({ 
        message: 'Заказ успешно оформлен', 
        order: orderResult.rows[0], 
        order_code: orderCode 
      });
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Получение заказа по order_code
  router.get('/code/:order_code', async (req, res) => {
    const { order_code } = req.params;
    try {
      const result = await pool.query('SELECT * FROM orders WHERE order_code = $1', [order_code]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Получение заказов пользователя
  router.get('/', authenticateToken, async (req, res) => {
    try {
      console.log('Запрос заказов для user_id:', req.user.id);
      const token = req.user;
      const result = await pool.query(
        `SELECT o.id, o.total_price, o.created_at, o.status, o.order_code,
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
         GROUP BY o.id, o.total_price, o.created_at, o.status, o.order_code
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
  router.get('/all', authenticateToken, checkAdmin, async (req, res) => {
    try {
      console.log('Запрос всех заказов для админа:', req.user.id);
      const result = await pool.query(
        `SELECT o.id, o.user_id, o.total_price, o.created_at, o.status, o.order_code,
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
         GROUP BY o.id, o.user_id, o.total_price, o.created_at, o.status, o.order_code, u.organization_name
         ORDER BY o.created_at DESC`
      );
      console.log('Результат всех заказов:', result.rows);
      res.json(result.rows);
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: 'Ошибка загрузки заказов', error: err.message });
    }
  });

  // Обновление статуса заказа (только для админа)
  router.put('/:orderId/status', authenticateToken, checkAdmin, async (req, res) => {
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

      // === Уведомление пользователей через Telegram ===
      try {
        // 1. Получить order_code по orderId
        const orderResult = await pool.query('SELECT order_code FROM orders WHERE id = $1', [orderId]);
        const order_code = orderResult.rows[0]?.order_code;
        if (order_code) {
          // 2. Получить user_id из tracked_orders
          const trackedResult = await pool.query('SELECT user_id FROM tracked_orders WHERE order_code = $1', [order_code]);
          const notifiedUsers = trackedResult.rows.map(row => row.user_id);
          // 3. Отправить уведомление через Telegram Bot API
          for (const userId of notifiedUsers) {
            await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
              chat_id: userId,
              text: `Статус вашего заказа ${order_code} изменён! Новый статус: ${status}`
            });
          }
        }
      } catch (e) {
        console.error('Ошибка при отправке уведомлений:', e);
      }
      // === Конец уведомления ===

      console.log('Статус обновлён:', result.rows[0]);
      res.json({ message: 'Статус заказа обновлён', order: result.rows[0] });
    } catch (err) {
      console.error('Ошибка запроса:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Добавить заказ в отслеживаемые
  router.post('/track', async (req, res) => {
    const { user_id, order_code } = req.body;
    if (!user_id || !order_code) {
      return res.status(400).json({ message: 'user_id и order_code обязательны' });
    }
    try {
      // Проверяем существование заказа
      const orderResult = await pool.query(
        'SELECT id FROM orders WHERE order_code = $1',
        [order_code]
      );
      
      if (orderResult.rows.length === 0) {
        return res.status(404).json({ message: 'Заказ с таким кодом не найден' });
      }

      // Добавляем в отслеживаемые
      await pool.query(
        'INSERT INTO tracked_orders (user_id, order_code) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [user_id, order_code]
      );
      res.json({ message: 'Заказ добавлен в отслеживаемые' });
    } catch (err) {
      console.error('Ошибка при добавлении заказа:', err);
      res.status(500).json({ message: 'Ошибка при добавлении заказа', error: err.message });
    }
  });

  // Получить все отслеживаемые заказы пользователя
  router.get('/track/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
      const result = await pool.query(
        `SELECT o.id, o.total_price, o.created_at, o.status, o.order_code
         FROM tracked_orders t
         JOIN orders o ON t.order_code = o.order_code
         WHERE t.user_id = $1
         ORDER BY o.created_at DESC`,
        [user_id]
      );
      
      if (result.rows.length === 0) {
        return res.json({ orders: [] });
      }

      res.json({ orders: result.rows });
    } catch (err) {
      console.error('Ошибка при получении заказов:', err);
      res.status(500).json({ message: 'Ошибка при получении заказов', error: err.message });
    }
  });

  return router;
};