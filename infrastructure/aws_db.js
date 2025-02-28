import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.RDS_HOST,
  user: process.env.RDS_USER,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT || 3306,  
  database: process.env.RDS_DBNAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
