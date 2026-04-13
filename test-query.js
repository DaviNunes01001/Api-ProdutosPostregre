require('dotenv').config();
const pool = require('./src/config/database');

async function testQuery() {
  try {
    const nome = 'Mouse';
    const sql = 'SELECT * FROM produtos WHERE nome ILIKE $1';
    const result = await pool.query(sql, [`%${nome}%`]);
    console.log('Result:', result.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

testQuery();