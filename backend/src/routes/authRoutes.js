const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Middleware для проверки JWT
  const authenticateToken = (req, res, next) => {
    if (req.path === '/login' || req.path === '/register') {
      return next();
    }
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(403).json({ message: 'Invalid token' });
      }
      req.user = user;
      next();
    });
  };

  // Применяем middleware только к защищенным маршрутам
  router.use('/profile', authenticateToken);
  router.use('/profile/address', authenticateToken);
  router.use('/refresh-token', authenticateToken);

  // Генерация токена
  const generateToken = (user) => {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Увеличиваем время жизни токена до 24 часов
    );
  };

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
      // Проверяем, существует ли пользователь
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (email, password, contact_face, organization_name, inn, egais_number, phone, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [email, hashedPassword, contactFace, organizationName, inn, egaisNumber, phone, 'user']
      );

      const user = result.rows[0];
      const token = generateToken(user);

      console.log('Registration successful:', { ...user, password: undefined });
      res.status(201).json({ 
        message: 'User registered successfully', 
        token,
        user: { ...user, password: undefined }
      });
    } catch (err) {
      console.error('Error in registration:', err.stack);
      res.status(500).json({ message: 'Ошибка при регистрации', error: err.message });
    }
  });

  router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'User not found' });
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      const token = generateToken(user);
      console.log('Login successful:', { ...user, password: undefined });
      
      res.json({ 
        message: 'Logged in successfully', 
        token,
        user: { ...user, password: undefined }
      });
    } catch (err) {
      console.error('Error in login:', err.stack);
      res.status(500).json({ message: 'Ошибка при входе', error: err.message });
    }
  });

  // Обновление токена
  router.post('/refresh-token', async (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = result.rows[0];
      const newToken = generateToken(user);

      res.json({ 
        message: 'Token refreshed', 
        token: newToken,
        user: { ...user, password: undefined }
      });
    } catch (err) {
      console.error('Error refreshing token:', err.stack);
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // Проверка валидности токена
  router.post('/verify-token', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ valid: false, message: 'Token required' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({ valid: true, user: decoded });
    } catch (err) {
      res.status(401).json({ valid: false, message: 'Invalid token' });
    }
  });

  router.get('/profile', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT email, contact_face, organization_name, inn, egais_number, phone, address FROM users WHERE id = $1',
        [req.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user: result.rows[0] });
    } catch (err) {
      console.error('Error fetching profile:', err.stack);
      res.status(500).json({ message: 'Ошибка при получении профиля', error: err.message });
    }
  });

  router.put('/profile/address', async (req, res) => {
    try {
      const { address } = req.body;
      if (!address) {
        return res.status(400).json({ message: 'Address is required' });
      }

      const result = await pool.query(
        'UPDATE users SET address = $1 WHERE id = $2 RETURNING *',
        [address, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ 
        message: 'Address updated successfully',
        user: { ...result.rows[0], password: undefined }
      });
    } catch (err) {
      console.error('Error updating address:', err.stack);
      res.status(500).json({ message: 'Ошибка при обновлении адреса', error: err.message });
    }
  });

  // Проверка статуса админа
  router.get('/check-admin', authenticateToken, (req, res) => {
    try {
      // req.user должен быть установлен authenticateToken
      const isAdmin = req.user && req.user.role === 'admin';
      res.json({ isAdmin });
    } catch (err) {
      res.status(500).json({ isAdmin: false, message: 'Ошибка проверки статуса админа' });
    }
  });

  return router;
};