import mysql, { PoolOptions, Pool } from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required environment variables
const {
  RDS_HOST,
  RDS_USER,
  RDS_PASSWORD,
  RDS_DBNAME,
  RDS_PORT,
} = process.env;

if (!RDS_HOST || !RDS_USER || !RDS_PASSWORD || !RDS_DBNAME) {
  throw new Error("Missing required RDS environment variables.");
}

// Parse RDS_PORT safely (default to 3306 if undefined)
const port: number = RDS_PORT ? parseInt(RDS_PORT, 10) : 3306;

// Define MySQL connection pool options
const poolOptions: PoolOptions = {
  host: RDS_HOST,
  user: RDS_USER,
  password: RDS_PASSWORD,
  database: RDS_DBNAME,
  port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create MySQL connection pool
const pool: Pool = mysql.createPool(poolOptions);

export default pool;