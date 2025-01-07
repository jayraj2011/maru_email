import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import multer from "multer";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);

const transporter = nodemailer.createTransport({
  service: "Gmail",
  secure: false,
  auth: {
    user: "jayrajb95@gmail.com",
    pass: "chaw wezg ctie wljg",
  },
});

const emailTemplate = () => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border: 1px solid #dddddd;
      border-radius: 5px;
      overflow: hidden;
    }
    .header {
      background-color: #007bff;
      color: #ffffff;
      text-align: center;
      padding: 10px 20px;
    }
    .content {
      padding: 20px;
      color: #333333;
    }
    .footer {
      background-color: #f4f4f4;
      color: #777777;
      text-align: center;
      font-size: 12px;
      padding: 10px;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Welcome, all!</h1>
    </div>
    <div class="content">
      <p>Thank you for signing up. We're excited to have you on board.</p>
      <p>If you have any questions, feel free to contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
    </div>
    <div class="footer">
      © 2024 Your Company. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, "uploads");
  },
  
  filename: function (req, file, cb) {
    let setFilename = file.originalname.split(".")
    let setFileExtension = setFilename[1];
    setFilename = setFilename[0];
    cb(null, setFilename + "-" + Date.now() + "." + setFileExtension);
  }
});

const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'filestorage')));

app.post("/send", upload.single('attachment'), (req, res) => {
  try {
    const { recipients, mailContent, subject } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: "Recipients list must be a non-empty array." });
    }

    const mailOptions = {
      from: '"Jayraj" <jayrajb95@gmail.com>',
      to: recipients.join(","),
      subject: subject,
      html: mailContent || "<p>Default email content</p>", // Ensure emailTemplate is defined
      attachments: req.file,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error.message);
        return res.status(500).json({ message: "Failed to send email", error: error.message });
      }
      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Email sent successfully!" });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
});

app.get("/", (req, res) => {
  res.json("server is running");
});

import mysql from 'mysql2';
// import { fileURLToPath } from "url";

app.get("/getMails", (req, res) => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'email_db'
  });
  
  // Connect to the database
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err.message);
    } else {
      console.log('Connected to the MySQL database.');
    }
  });

  connection.query('SELECT * FROM client_info', (err, results) => {
    if (err) {
      console.error('Error executing query:', err.message);
      return;
    }
    res.status(200).json(results);
  });
  
  // Close the connection
  connection.end((err) => {
    if (err) {
      console.error('Error closing the connection:', err.message);
      return;
    }
    console.log('Database connection closed.');
  });
})

app.listen(4123, () => {
  console.log("server is running");
});
