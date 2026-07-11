import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

let pool;

export async function initDatabase() {
  try {
    // Connect without database first
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server.');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'escrow_db'}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Database \`${process.env.DB_NAME || 'escrow_db'}\` checked/created.`);
    await connection.end();

    // Now initialize pool with the database specified
    pool = mysql.createPool({
      ...dbConfig,
      database: process.env.DB_NAME || 'escrow_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Run schema.sql to create tables if they don't exist
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const conn = await pool.getConnection();
      try {
        await conn.query(schemaSql);
        console.log('Database schema successfully verified/initialized.');
      } finally {
        conn.release();
      }
    } else {
      console.warn('schema.sql not found, skipping table initialization.');
    }

  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

export async function query(sql, params) {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase first.');
  }
  const [results] = await pool.query(sql, params);
  return results;
}

export default {
  initDatabase,
  query,
  getPool: () => pool
};
