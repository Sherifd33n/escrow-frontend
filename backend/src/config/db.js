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
        
        // Run migration to add columns if they are missing
        await runMigrations(conn);
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

async function runMigrations(conn) {
  // Check and rename old columns if they exist
  try {
    const [discoveryCols] = await conn.query("SHOW COLUMNS FROM users LIKE 'privacy_discovery'");
    if (discoveryCols.length > 0) {
      console.log("Migration: Renaming privacy_discovery to public_profile...");
      await conn.query("ALTER TABLE users CHANGE COLUMN privacy_discovery public_profile TINYINT(1) NOT NULL DEFAULT 1");
    }
  } catch (err) {
    console.error("Migration failed to rename privacy_discovery:", err);
  }

  try {
    const [marketingCols] = await conn.query("SHOW COLUMNS FROM users LIKE 'privacy_marketing'");
    if (marketingCols.length > 0) {
      console.log("Migration: Renaming privacy_marketing to marketing_comms...");
      await conn.query("ALTER TABLE users CHANGE COLUMN privacy_marketing marketing_comms TINYINT(1) NOT NULL DEFAULT 0");
    }
  } catch (err) {
    console.error("Migration failed to rename privacy_marketing:", err);
  }

  const columnsToAdd = [
    { name: 'two_factor_enabled', definition: 'TINYINT(1) NOT NULL DEFAULT 0' },
    { name: 'notif_email', definition: 'TINYINT(1) NOT NULL DEFAULT 1' },
    { name: 'notif_sms', definition: 'TINYINT(1) NOT NULL DEFAULT 0' },
    { name: 'notif_push', definition: 'TINYINT(1) NOT NULL DEFAULT 1' },
    { name: 'public_profile', definition: 'TINYINT(1) NOT NULL DEFAULT 1' },
    { name: 'marketing_comms', definition: 'TINYINT(1) NOT NULL DEFAULT 0' }
  ];

  for (const col of columnsToAdd) {
    try {
      const [rows] = await conn.query(`SHOW COLUMNS FROM users LIKE ?`, [col.name]);
      if (rows.length === 0) {
        console.log(`Migration: Adding column ${col.name} to users table...`);
        await conn.query(`ALTER TABLE users ADD COLUMN \`${col.name}\` ${col.definition}`);
      }
    } catch (err) {
      console.error(`Migration failed for column ${col.name}:`, err);
    }
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
