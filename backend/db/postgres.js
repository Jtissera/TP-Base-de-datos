const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: String(process.env.PG_PASSWORD || ''),
});

async function initDatabase() {
  try {
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('PostgreSQL schema initialized successfully.');
  } catch (error) {
    console.error('Error initializing PostgreSQL database:', error);
  }
}

module.exports = { pool, initDatabase };