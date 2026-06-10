const express = require('express');
const router = express.Router();
const { pool } = require('../db/postgres');
const protectByRole = require('../middleware/auth');



router.get('/classrooms/availability', protectByRole(['administrator', 'teacher']), async (req, res) => {
  const { date, startTime, endTime } = req.query;

  if (!date || !startTime || !endTime) {
    return res.status(400).json({ success: false, error: 'Missing required query parameters (date, startTime, endTime).' });
  }

  try {
    const result = await pool.query(
      `SELECT c.* FROM classrooms c
       WHERE c.id NOT IN (
           SELECT r.classroom_id 
           FROM reservations r
           WHERE r.date = $1 
             AND r.status = 'active'
             AND (
                 ($2 >= r.start_time AND $2 < r.end_time) OR
                 ($3 > r.start_time AND $3 <= r.end_time) OR
                 ($2 <= r.start_time AND $3 >= r.end_time)
             )
       )
       ORDER BY c.name ASC`,
      [date, startTime, endTime]
    );

    return res.json({
      success: true,
      availableClassrooms: result.rows
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error checking availability.' });
  }
});

router.post('/classrooms', protectByRole(['administrator']), async (req, res) => {
  const { name, capacity, location } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO classrooms (name, capacity, location) VALUES ($1, $2, $3) RETURNING *',
      [name, capacity, location]
    );

    return res.status(201).json({
      success: true,
      message: 'Classroom created successfully by the administrator.',
      classroom: result.rows[0]
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Error creating the classroom.'
    });
  }
});

router.put('/classrooms/:id', protectByRole(['administrator']), async (req, res) => {
  const { id } = req.params;
  const { name, capacity, location } = req.body;

  try {
    const result = await pool.query(
      'UPDATE classrooms SET name = $1, capacity = $2, location = $3 WHERE id = $4 RETURNING *',
      [name, capacity, location, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Classroom not found.' });
    }

    return res.json({
      success: true,
      message: 'Classroom updated successfully by the administrator.',
      classroom: result.rows[0]
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Error updating the classroom.'
    });
  }
});

router.get('/classrooms', protectByRole(['administrator', 'teacher']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classrooms ORDER BY name ASC');
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});


router.delete('/classrooms/:id', protectByRole(['administrator']), async (req, res) => {
  const classroomId = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM classrooms WHERE id = $1 RETURNING *',
      [classroomId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Classroom not found.'
      });
    }

    return res.json({
      success: true,
      message: `Classroom "${result.rows[0].name}" was deleted successfully by the administrator.`
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Error deleting the classroom.'
    });
  }
});

module.exports = router;