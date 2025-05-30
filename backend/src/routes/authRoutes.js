import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express from 'express';

export default (sql) => {
  const router = express.Router();

  // Middleware для проверки токена
  router.use((req, res, next) => {
    if (req.path === '/login' || req.path === '/register') {
      return next();
    }
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
      req.user = user;
      next();
    });
  });

  // Регистрация
  router.post('/register', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('contactFace').notEmpty().withMessage('Contact face is required'),
    body('organizationName').notEmpty().withMessage('Organization name is required'),
    body('inn').notEmpty().withMessage('INN is required'),
    body('egaisNumber').notEmpty().withMessage('EGAIS number is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, contactFace, organizationName, inn, egaisNumber, phone } = req.body;
    console.log('Registration attempt:', { email, contactFace, organizationName, inn, egaisNumber, phone });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await sql`
        INSERT INTO users (email, password, contact_face, organization_name, inn, egais_number, phone, role)
        VALUES (${email}, ${hashedPassword}, ${contactFace}, ${organizationName}, ${inn}, ${egaisNumber}, ${phone}, 'user')
        RETURNING *`;
      console.log('Registration successful:', result[0]);
      res.status(201).json({ message: 'User registered', user: result[0] });
    } catch (err) {
      console.error('Error in query:', err.stack);
      res.status(500).json({ message: 'Ошибка при регистрации', error: err.message });
    }
  });

  // Логин
  router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const result = await sql`SELECT * FROM users WHERE email = ${email}`;
      if (result.length === 0) return res.status(400).json({ message: 'User not found' });

      const user = result[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ message: 'Logged in', token });
    } catch (err) {
      console.error('Error in query:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Получение данных профиля
  router.get('/profile', async (req, res) => {
    try {
      const token = req.user;
      const result = await sql`
        SELECT email, contact_face, organization_name, inn, egais_number, phone, address
        FROM users
        WHERE id = ${token.id}`;
      if (result.length === 0) return res.status(404).json({ message: 'User not found' });
      res.json({ user: result[0] });
    } catch (err) {
      console.error('Error in query:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  // Обновление адреса доставки
  router.put('/profile/address', async (req, res) => {
    try {
      const token = req.user;
      const { address } = req.body;
      await sql`UPDATE users SET address = ${address} WHERE id = ${token.id}`;
      res.json({ message: 'Address updated' });
    } catch (err) {
      console.error('Error in query:', err.stack);
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};