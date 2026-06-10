const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: 'postgres', 
  host: 'localhost',
  database: 'aulas',
  password: 'postgres', 
  port: 5432,
});

async function resetAdmin() {
  const newPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  try {
    const res = await pool.query("SELECT * FROM users WHERE email = 'admin@university.edu'");
    if (res.rows.length === 0) {
      console.log('❌ No existe el usuario admin@university.edu en la base de datos.');
    } else {
      await pool.query(
        `UPDATE users SET password_hash = $1 WHERE email = 'admin@university.edu'`,
        [hashedPassword]
      );
      console.log('✅ Contraseña de admin reseteada con éxito a: admin123');
    }
  } catch (err) {
    console.error('Error detallado:', err);
  } finally {
    await pool.end();
    process.exit();
  }
}

resetAdmin();