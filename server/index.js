import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import multer from "multer";
import path from "path";
import juice from "juice";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mysql from "mysql2";

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },

  filename: function (req, file, cb) {
    let setFilename = file.originalname.split(".");
    let setFileExtension = setFilename[1];
    setFilename = setFilename[0];
    cb(null, setFilename + "-" + Date.now() + "." + setFileExtension);
  },
});

const upload = multer({ storage });

app.use("/uploads", express.static(path.join(__dirname, "filestorage")));

const quillStyles = `
  /* Alignment */
  .ql-align-right { text-align: right; }
  .ql-align-center { text-align: center; }
  .ql-align-justify { text-align: justify; }
  .ql-align-left { text-align: left; }

  /* Font Size */
  .ql-size-small { font-size: 0.75em; }
  .ql-size-large { font-size: 1.5em; }
  .ql-size-huge { font-size: 2.5em; }

  /* Font Style */
  .ql-font-monospace { font-family: monospace; }
  .ql-font-serif { font-family: serif; }
  .ql-font-sans-serif { font-family: sans-serif; }

  /* Blockquote */
  blockquote { 
    border-left: 4px solid #ccc; 
    margin: 0; 
    padding-left: 1em; 
    color: #666;
    font-style: italic; 
  }

  /* Text Decoration */
  .ql-strike { text-decoration: line-through; }
  .ql-underline { text-decoration: underline; }
  .ql-bold { font-weight: bold; }
  .ql-italic { font-style: italic; }

  /* Indent */
  .ql-indent-1 { padding-left: 3em; }
  .ql-indent-2 { padding-left: 6em; }
  .ql-indent-3 { padding-left: 9em; }
  .ql-indent-4 { padding-left: 12em; }

  /* List */
  .ql-list-ordered { list-style-type: decimal; }
  .ql-list-bullet { list-style-type: disc; }
  .ql-list-item { margin-left: 1.5em; }

  /* Background Color */
  .ql-background-yellow { background-color: yellow; }
  .ql-background-green { background-color: green; }
  .ql-background-blue { background-color: blue; }
  .ql-background-red { background-color: red; }

  /* Text Color */
  .ql-color-red { color: red; }
  .ql-color-blue { color: blue; }
  .ql-color-green { color: green; }
  .ql-color-yellow { color: yellow; }

  /* Code Block */
  pre { 
    background: #f4f4f4; 
    padding: 1em; 
    overflow-x: auto; 
    border-radius: 5px; 
  }
  code { 
    font-family: monospace; 
    background-color: #f4f4f4; 
    padding: 2px 4px; 
    border-radius: 4px; 
  }
`;

// Include these styles in the Juice options
const juiceOptions = { extraCss: quillStyles };

app.post("/send", upload.array("attachment", 5), (req, res) => {
  try {
    const { recipients, mailContent, subject } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res
        .status(400)
        .json({ message: "Recipients list must be a non-empty array." });
    }

    let Content = juice(mailContent, juiceOptions);
    const mailOptions = {
      from: '"Jayraj" <jayrajb95@gmail.com>',
      to: recipients.join(","),
      subject: subject,
      html: Content || "<p>Default email content</p>", // Ensure emailTemplate is defined
      attachments: req.files,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error.message);
        return res
          .status(500)
          .json({ message: "Failed to send email", error: error.message });
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

app.get("/getMails", (req, res) => {
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "email_db",
  });

  // Connect to the database
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err.message);
    } else {
      console.log("Connected to the MySQL database.");
    }
  });

  connection.query("SELECT * FROM client_info", (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      return;
    }
    res.status(200).json(results);
  });

  // Close the connection
  connection.end((err) => {
    if (err) {
      console.error("Error closing the connection:", err.message);
      return;
    }
    console.log("Database connection closed.");
  });
});

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
    host: "localhost",
    user: "root",
    password: "",
    database: "email_db",
  });

  // Connect to the database
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err.message);
    } else {
      console.log("Connected to the MySQL database.");
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
      const client_info = await queryDatabase(connection, new_query, [
        company.id,
      ]);

      const individual_company = {
        id: company.id,
        company_name: company.company_name,
        email_ids: client_info,
      };

      query_result.push(individual_company);
    }

    // Send the result as JSON
    res.status(200).json(query_result);
  } catch (error) {
    console.error("Error during query execution:", error.message);
    res.status(500).json({ message: "Error processing request" });
  } finally {
    // Close the connection after all queries are complete
    connection.end((err) => {
      if (err) {
        console.error("Error closing the connection:", err.message);
      } else {
        console.log("Database connection closed.");
      }
    });
  }
});

app.get("/company", (req, res) => {
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "email_db",
  });

  // Connect to the database
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err.message);
    } else {
      console.log("Connected to the MySQL database.");
    }
  });

  var query = "SELECT * FROM company";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      return;
    }
    res.status(200).json(results);
  });

  // Close the connection
  connection.end((err) => {
    if (err) {
      console.error("Error closing the connection:", err.message);
      return;
    }
    console.log("Database connection closed.");
  });
});

app.post("/company", (req, res) => {
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "email_db",
  });

  // Connect to the database
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err.message);
    } else {
      console.log("Connected to the MySQL database.");
    }
  });

  const { company_name } = req.body;

  if (company_name == "") {
    res
      .status(500)
      .json({ message: "Data is emptty, please provide valid data!" });
  }

  console.log("company_name", company_name);
  var query = "INSERT INTO company (company_name) VALUES(?)";

  connection.query(query, [company_name], (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      return;
    }
    res.status(200).json(results);
  });

  // Close the connection
  connection.end((err) => {
    if (err) {
      console.error("Error closing the connection:", err.message);
      return;
    }
    console.log("Database connection closed.");
  });
});

app.post("/email", (req, res) => {
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "email_db",
  });

  // Connect to the database
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err.message);
    } else {
      console.log("Connected to the MySQL database.");
    }
  });

  const { company_id, company_email } = req.body;

  connection.query(
    "INSERT INTO client_info (company_id, company_email) VALUES (?, ?)",
    [company_id, company_email],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        return;
      }
      res.status(200).json(results);
    }
  );

  // Close the connection
  connection.end((err) => {
    if (err) {
      console.error("Error closing the connection:", err.message);
      return;
    }
    console.log("Database connection closed.");
  });
});

app.delete("/email", (req, res) => {
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "email_db",
  });

  // Connect to the database
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err.message);
    } else {
      console.log("Connected to the MySQL database.");
    }
  });

  const { id } = req.body;

  connection.query(
    "DELETE FROM client_info WHERE id=?",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        return;
      }
      res.status(200).json(results);
    }
  );

  // Close the connection
  connection.end((err) => {
    if (err) {
      console.error("Error closing the connection:", err.message);
      return;
    }
    console.log("Database connection closed.");
  });
});

app.listen(4123, () => {
  console.log("server is running");
});
