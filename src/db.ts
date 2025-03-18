import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: Number(process.env.DATABASE_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: Number(process.env.DATABASE_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
