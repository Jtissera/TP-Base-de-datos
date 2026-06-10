const express = require('express');
const cors = require('cors');
const { pool } = require('./db/postgres');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const reservationRoutes = require('./routes/reservations');
const classroomRoutes = require('./routes/classrooms');
const subjectRoutes = require('./routes/subjects');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', reservationRoutes);
app.use('/api', classroomRoutes);
app.use('/api', subjectRoutes);
app.use('/api', adminRoutes);

app.get('/health', async (req, res) => {
  let postgresStatus = "error";
  let mongodbStatus = "error";

  try {
    await pool.query('SELECT NOW()');
    postgresStatus = "ok";
  } catch (err) {
    postgresStatus = `error: ${err.message}`;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      mongodbStatus = "ok";
    } else {
      mongodbStatus = "disconnected";
    }
  } catch (err) {
    mongodbStatus = `error: ${err.message}`;
  }

  res.json({
    postgres: postgresStatus,
    mongodb: mongodbStatus
  });
});

module.exports = app;