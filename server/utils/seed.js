// Run with: npm run seed
// Creates/updates the default admin account using values from .env (or fallback defaults)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@store.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
  const name = process.env.SEED_ADMIN_NAME || 'Store Owner';

  const hashed = await bcrypt.hash(password, 10);

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing[0]) {
    await pool.query('UPDATE users SET password = ?, name = ?, role = "admin", is_active = TRUE WHERE email = ?', [hashed, name, email]);
    console.log(`✅ Admin account updated: ${email} / ${password}`);
  } else {
    await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "admin")', [name, email, hashed]);
    console.log(`✅ Admin account created: ${email} / ${password}`);
  }
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
