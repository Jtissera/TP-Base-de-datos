const express = require('express');
const router = express.Router();
const { pool } = require('../db/postgres');
const Log = require('../models/Log');
const protectByRole = require('../middleware/auth');

router.post('/reservations', protectByRole(['administrator', 'teacher']), async (req, res) => {
  const { classroomId, subjectId, userId, date, startTime, endTime, userEmail, classroomName } = req.body;

  try {
    const result = await pool.query(
      'SELECT sp_create_reservation($1, $2, $3, $4, $5, $6) AS reservation_id',
      [classroomId, subjectId, userId, date, startTime, endTime]
    );
    
    const newId = result.rows[0].reservation_id;

    Log.create({
      actionType: 'CREATE',
      user: { id: userId, email: userEmail },
      classroom: { id: classroomId, name: classroomName },
      reservationDetails: {
        reservationId: newId,
        reservationDate: date,
        startTime,
        endTime
      }
    }).catch(err => console.error('MongoDB Logging Error:', err));

    return res.status(201).json({
      success: true,
      message: 'Reservation created successfully and consistently.',
      reservationId: newId
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Transaction internal server error.'
    });
  }
});

router.put('/reservations/:id', protectByRole(['administrator', 'teacher']), async (req, res) => {
  const reservationId = req.params.id;
  const { classroomId, date, startTime, endTime, userEmail, classroomName } = req.body;
  const userId = req.user.id; 

  try {
    await pool.query(
      'SELECT sp_modify_reservation($1, $2, $3, $4, $5, $6)',
      [reservationId, classroomId, userId, date, startTime, endTime]
    );

    Log.create({
      actionType: 'UPDATE',
      user: { id: userId, email: userEmail || req.user.email },
      classroom: { id: classroomId, name: classroomName || 'Updated Classroom' },
      reservationDetails: {
        reservationId: parseInt(reservationId),
        reservationDate: date,
        startTime,
        endTime
      }
    }).catch(err => console.error('MongoDB Logging Error:', err));

    return res.json({
      success: true,
      message: 'Reservation updated successfully.'
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Error updating the reservation.'
    });
  }
});

router.patch('/reservations/:id/cancel', protectByRole(['administrator', 'teacher']), async (req, res) => {
  const reservationId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const result = await pool.query(
      `UPDATE reservations 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
         AND status = 'active'
         AND ($2 = 'administrator' OR user_id = $3)
       RETURNING *`,
      [reservationId, userRole, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Reservation not found, already cancelled, or you lack permissions to alter it.'
      });
    }

    const cancelledRes = result.rows[0];

    Log.create({
      actionType: 'CANCEL',
      user: { id: userId, email: req.user.email },
      classroom: { id: cancelledRes.classroom_id, name: 'Cancelled Room Fetch' },
      reservationDetails: {
        reservationId: cancelledRes.id,
        reservationDate: cancelledRes.date.toISOString().split('T')[0],
        startTime: cancelledRes.start_time,
        endTime: cancelledRes.end_time
      }
    }).catch(err => console.error('MongoDB Logging Error:', err));

    return res.json({
      success: true,
      message: 'Reservation cancelled successfully.'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error during cancellation.'
    });
  }
});

router.get('/reservations/my-reservations', protectByRole(['teacher']), async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT r.id, r.date, r.start_time, r.end_time, r.status,
              c.name AS classroom_name, c.location AS classroom_location,
              s.name AS subject_name
       FROM reservations r
       INNER JOIN classrooms c ON r.classroom_id = c.id
       INNER JOIN subjects s ON r.subject_id = s.id
       WHERE r.user_id = $1
       ORDER BY r.date DESC, r.start_time DESC`,
      [userId]
    );

    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error fetching your reservations.' });
  }
});


router.get('/reservations', protectByRole(['administrator']), async (req, res) => {
  const { date, classroomId } = req.query;
  
  let queryText = `
    SELECT r.id, r.date, r.start_time, r.end_time, r.status,
           c.name AS classroom_name,
           s.name AS subject_name,
           u.name AS teacher_name, u.email AS teacher_email
    FROM reservations r
    INNER JOIN classrooms c ON r.classroom_id = c.id
    INNER JOIN subjects s ON r.subject_id = s.id
    INNER JOIN users u ON r.user_id = u.id
    WHERE 1=1
  `;
  const queryParams = [];

  if (date) {
    queryParams.push(date);
    queryText += ` AND r.date = $${queryParams.length}`;
  }

  if (classroomId) {
    queryParams.push(classroomId);
    queryText += ` AND r.classroom_id = $${queryParams.length}`;
  }

  queryText += ' ORDER BY r.date DESC, r.start_time DESC';

  try {
    const result = await pool.query(queryText, queryParams);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error auditing reservations.' });
  }
});

module.exports = router;