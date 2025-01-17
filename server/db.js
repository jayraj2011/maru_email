import mysql from "mysql2";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "email_db",
  waitForConnections: true,
  queueLimit: 0, // Unlimited queue size
});

export const db = pool.promise();