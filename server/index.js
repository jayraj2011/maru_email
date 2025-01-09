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

app.post("/send", upload.array('attachment', 5), (req, res) => {
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
      attachments: req.files,
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

function queryDatabase(connection, query, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (err, results) => {
      if (err) {
        reject(err); // Reject the promise if there is an error
      } else {
        resolve(results); // Resolve the promise with the results
      }
    });
  });
}

app.get("/mails", async (req, res) => {
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

  var query = "SELECT * FROM company";

  const query_result = [];

  try {
    // Execute the first query (SELECT * FROM company)
    const companies = await queryDatabase(connection, query);

    // For each company, execute a sub-query to fetch client info
    for (let company of companies) {
      const new_query = "SELECT * FROM client_info WHERE company_id=?";
      const client_info = await queryDatabase(connection, new_query, [company.id]);

      const individual_company = {
        id: company.id,
        company_name: company.company_name,
        email_ids: client_info
      };

      query_result.push(individual_company);
    }

    // Send the result as JSON
    res.status(200).json(query_result);
  } catch (error) {
    console.error('Error during query execution:', error.message);
    res.status(500).json({ message: 'Error processing request' });
  } finally {
    // Close the connection after all queries are complete
    connection.end((err) => {
      if (err) {
        console.error('Error closing the connection:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }


})

app.get("/company", (req, res) => {
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

  var query = "SELECT * FROM company";

  connection.query(query, (err, results) => {
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

app.post("/email", (req, res) => {
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

  const {company_id, company_email} = req.body;

  connection.query('INSERT INTO client_info (company_id, company_email) VALUES (?, ?)', [company_id, company_email], (err, results) => {
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

app.delete("/email", (req, res) => {
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

  const {id} = req.body;

  connection.query('DELETE FROM client_info WHERE id=?', [id], (err, results) => {
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
