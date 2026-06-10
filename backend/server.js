require('dotenv').config();
const app = require('./app');
const connectMongo = require('./db/mongo');
const { pool, initDatabase } = require('./db/postgres');

async function start() {
  try {
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL physical connection established.');
    await initDatabase();

    await connectMongo();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server currently running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Critical error during server initialization:', error);
    process.exit(1);
  }
}

start();