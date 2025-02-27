import mysql from "mysql2";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "email_db",
  waitForConnections: true,
  queueLimit: 0, // Unlimited queue size
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    // console.log("✅ Database connected successfully!");
    connection.release(); // Release connection back to pool
  }
});

export const db = pool.promise();
