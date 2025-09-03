const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const db = require('./db');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.SECRET_KEY;

// --- Register User + Teacher ---
app.post('/register', async (req, res) => {
  const { email, first_name, last_name, password, university_name, gender, year_joined } = req.body;
  try {
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert into auth_user
    const [result] = await db.query(
      'INSERT INTO auth_user (email, first_name, last_name, password) VALUES (?, ?, ?, ?)',
      [email, first_name, last_name, hashedPassword]
    );

    const userId = result.insertId;

    // insert into teachers
    await db.query(
      'INSERT INTO teachers (user_id, university_name, gender, year_joined) VALUES (?, ?, ?, ?)',
      [userId, university_name, gender, year_joined]
    );

    res.json({ message: 'User + Teacher created successfully', userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Login ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM auth_user WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Middleware to verify JWT ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// --- Protected route: Get teachers list ---
app.get('/teachers', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.email, a.first_name, a.last_name, 
              t.university_name, t.gender, t.year_joined
       FROM auth_user a
       JOIN teachers t ON a.id = t.user_id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
