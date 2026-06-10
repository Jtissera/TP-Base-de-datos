const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/postgres');
const protectByRole = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_secret_key';

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, \'teacher\') RETURNING id, name, email, role',
      [name, email, passwordHash]
    );

    const newUser = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Teacher account created successfully.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role 
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      success: true,
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

router.get('/me', protectByRole(['administrator', 'teacher']), async (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;