const express = require('express');
const router = express.Router();
const { pool } = require('../db/postgres');
const protectByRole = require('../middleware/auth');


router.post('/subjects', protectByRole(['administrator']), async (req, res) => {
  const { name } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO subjects (name) VALUES ($1) RETURNING *',
      [name]
    );

    return res.status(201).json({
      success: true,
      message: 'Subject added to the master catalog.',
      subject: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'A subject with this name already exists.' });
    }
    return res.status(400).json({ success: false, error: 'Error creating the subject.' });
  }
});


router.get('/subjects', protectByRole(['administrator', 'teacher']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY name ASC');
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error fetching subjects.' });
  }
});


router.get('/subjects/my-subjects', protectByRole(['teacher']), async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT s.id, s.name 
       FROM subjects s
       INNER JOIN teacher_subjects ts ON s.id = ts.subject_id
       WHERE ts.user_id = $1
       ORDER BY s.name ASC`,
      [userId]
    );

    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error fetching your subjects.' });
  }
});


router.post('/subjects/my-subjects', protectByRole(['teacher']), async (req, res) => {
  const userId = req.user.id;
  const { subjectIds } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM teacher_subjects WHERE user_id = $1', [userId]);

    if (subjectIds && subjectIds.length > 0) {
      const insertValues = [];
      const queryParams = [userId];
      
      subjectIds.forEach((subjectId, index) => {
        queryParams.push(subjectId);
        insertValues.push(`($1, $${index + 2})`);
      });

      const insertQuery = `INSERT INTO teacher_subjects (user_id, subject_id) VALUES ${insertValues.join(', ')}`;
      await client.query(insertQuery, queryParams);
    }

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Your subjects have been successfully synchronized.'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, error: 'Error synchronizing subjects. Transaction rolled back.' });
  } finally {
    client.release();
  }
});

module.exports = router;