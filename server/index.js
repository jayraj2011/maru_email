import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import multer from "multer";
import path from "path";
import juice from "juice";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import { SendMailClient } from "zeptomail";
import cluster from "cluster";
import os from "node:os";
import { db } from "./db.js";
import {} from "dotenv/config";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import xlsx from "xlsx";
import axios from "../client/src/api/axios.js";

function checkJWTToken(req, res, next) {
  // // console.log(req);

  // // console.log("inside middleware");
  const token = req.headers["authorization"];

  // // console.log("inside middleware 1");
  // // console.log(authCookie);

  // If there is no cookie, return an error
  if (token == null || token == undefined) return res.sendStatus(401);

  // // console.log(token);
  // // console.log("cookie", authCookie);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    // // console.log(err);

    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
}

const startServer = () => {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "http://192.168.0.103:5173",
      transports: ["websocket", "polling"],
    },
    allowEIO3: true,
    pingTimeout: 1000 * 60 * 60,
    pingInterval: 25000,
    maxHttpBufferSize: 1e7,
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cors({
      origin: "http://192.168.0.103:5173",
      credentials: true,
    })
  );
  app.use(cookieParser());

  // ["http://localhost:5173", "http://localhost:5174", "http://192.168.29.230:5173/"]

  // const transporter = nodemailer.createTransport({
  //   // service: "Gmail",
  //   smtp: "smtp.zeptomail.com",
  //   port: 587,
  //   secure: true,
  //   auth: {
  //     // user: "jayrajb95@gmail.com",
  //     // pass: "chaw wezg ctie wljg",
  //     user: "admin@labourlaws.co.in",
  //     pass: "ds39uWFwHr0F",
  //   },
  // });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },

    filename: function (req, file, cb) {
      // let setFilename = file.originalname.split(".");
      // let setFileExtension = setFilename[1];
      // setFilename = setFilename[0];
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage });
  const url = "api.zeptomail.com/";
  const token =
    "Zoho-enczapikey wSsVR60l8hT5C/h1njX5JO9szVUEBgn+Ek4r0Af06Xf8T63Apsc5whfIAwbyGqRJGWRpQTREp+h8m0sC02dahth/mwtRCiiF9mqRe1U4J3x17qnvhDzJW2hUmxKILosKxQpqmWBnE80g+g==";

  app.use("/uploads", express.static(path.join(__dirname, "filestorage")));

  const quillStyles = `
  /* Alignment */
  .ql-align-right { text-align: right; }
  .ql-align-center { text-align: center; }
  .ql-align-justify { text-align: justify; }
  .ql-align-left { text-align: left; }

  /* Font Size */
  .ql-size-small { font-size: 0.75em; }
  .ql-size-regular {font-size: 1rem; }
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
  .ql-link {color: #007bff; text-decoration: underline;}
  .ql-code {background-color: #f8f9fa; color: #212529; font-family: Menlo, Monaco, monospace;}


  /* Indent */
  .ql-indent-1 { padding-left: 3em; }
  .ql-indent-2 { padding-left: 6em; }
  .ql-indent-3 { padding-left: 9em; }
  .ql-indent-4 { padding-left: 12em; }
  .ql-indent-5 { padding-left: 15em; }
  .ql-indent-6 { padding-left: 18em; }
  .ql-indent-7 { padding-left: 21em; }

  /* List */
  .ql-list-ordered { list-style-type: decimal; }
  .ql-list-bullet { list-style-type: disc; }
  .ql-list-item { margin-left: 1.5em; }

  /* Headers */
  .ql-header-h1 {font-size: 2.5em; font-weight: bold;}
  .ql-header-h2 {font-size: 2em; font-weight: bold;}
  .ql-header-h3 {font-size: 1.75em; font-weight: bold;}
  .ql-header-h4 {font-size: 1.5em; font-weight: bold;}
  .ql-header-h5 {font-size: 1.25em; font-weight: bold;}
  .ql-header-h6 {font-size: 1em; font-weight: bold;}

  /* Background Color */
  .ql-background-red { background-color: #e60000; }
  .ql-background-orange { background-color: #f90; }
  .ql-background-yellow { background-color: #ff0; }
  .ql-background-green { background-color: #008a00; }
  .ql-background-blue { background-color: #06c; }
  .ql-background-purple { background-color: #9933ff; }
  .ql-background-black { background-color: #000; }
  .ql-background-gray { background-color: #808080; }
  .ql-background-lightgray { background-color: #d3d3d3; }
  .ql-background-white { background-color: #fff; }
  .ql-background-pink { background-color: #ffc0cb; }
  .ql-background-brown { background-color: #a52a2a; }
  .ql-background-teal { background-color: #008080; }
  .ql-background-cyan { background-color: #00ffff; }
  .ql-background-lime { background-color: #00ff00; }
  .ql-background-navy { background-color: #000080; }
  .ql-background-maroon { background-color: #800000; }
  .ql-background-olive { background-color: #808000; }
  .ql-background-gold { background-color: #ffd700; }
  .ql-background-aqua { background-color: #00FFFF; }
  .ql-background-beige { background-color: #F5F5DC; }
  .ql-background-coral { background-color: #FF7F50; }
  .ql-background-fuchsia { background-color: #FF00FF; }
  .ql-background-ivory { background-color: #FFFFF0; }
  .ql-background-khaki { background-color: #F0E68C; }
  .ql-background-lavender { background-color: #E6E6FA; }
  .ql-background-magenta { background-color: #FF00FF; }
  .ql-background-orchid { background-color: #DA70D6; }
  .ql-background-plum { background-color: #8E4585; }
  .ql-background-salmon { background-color: #FA8072; }
  .ql-background-sienna { background-color: #A0522D; }
  .ql-background-silver { background-color: #C0C0C0; }
  .ql-background-tan { background-color: #D2B48C; }
  .ql-background-turquoise { background-color: #40E0D0; }
  .ql-background-violet { background-color: #EE82EE; }

  .ql-primary {background-color: #007bff; color: #ffffff;}
  .ql-secondary {background-color: #6c757d; color: #ffffff;}
  .ql-success {background-color: #28a745; color: #ffffff;}
  .ql-danger {background-color: #dc3545; color: #ffffff;}
  .ql-warning {background-color: #ffc107; color: #212529;}
  .ql-info {background-color: #17a2b8; color: #ffffff;}
  .ql-light {background-color: #f8f9fa; color: #212529;}
  .ql-dark {background-color: #343a40; color: #ffffff;}


  /* Text Color */
  .ql-color-red { color: #e60000; }
  .ql-color-orange { color: #f90; }
  .ql-color-yellow { color: #ff0; }
  .ql-color-green { color: #008a00; }
  .ql-color-blue { color: #06c; }
  .ql-color-purple { color: #9933ff; }
  .ql-color-black { color: #000; }
  .ql-color-gray { color: #808080; }
  .ql-color-lightgray { color: #d3d3d3; }
  .ql-color-white { color: #fff; }
  .ql-color-pink { color: #ffc0cb; }
  .ql-color-brown { color: #a52a2a; }
  .ql-color-teal { color: #008080; }
  .ql-color-cyan { color: #00ffff; }
  .ql-color-lime { color: #00ff00; }
  .ql-color-navy { color: #000080; }
  .ql-color-maroon { color: #800000; }
  .ql-color-olive { color: #808000; }
  .ql-color-gold { color: #ffd700; }
  .ql-color-aqua { color: #00FFFF; }
  .ql-color-beige { color: #F5F5DC; }
  .ql-color-coral { color: #FF7F50; }
  .ql-color-fuchsia { color: #FF00FF; }
  .ql-color-ivory { color: #FFFFF0; }
  .ql-color-khaki { color: #F0E68C; }
  .ql-color-lavender { color: #E6E6FA; }
  .ql-color-magenta { color: #FF00FF; }
  .ql-color-orchid { color: #DA70D6; }
  .ql-color-plum { color: #8E4585; }
  .ql-color-salmon { color: #FA8072; }
  .ql-color-sienna { color: #A0522D; }
  .ql-color-silver { color: #C0C0C0; }
  .ql-color-tan { color: #D2B48C; }
  .ql-color-turquoise { color: #40E0D0; }
  .ql-color-violet { color: #EE82EE; }

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

  .ql-script {font-family: 'Courier New', Courier, monospace; font-size: 14px;}
  .ql-preformatted {white-space: pre-wrap; word-wrap: break-word;}
  .ql-check {text-decoration: check;}
  .ql-task {list-style-type: none; padding-left: 15px; position: relative;}
  .ql-task-checked {text-decoration: check;}

  /* Check list */
 ul[data-checked="true"] input[type="checkbox"] {
    accent-color: green;
    background-color: green;
  }

  ul[data-checked="false"] input[type="checkbox"] {
    accent-color: gray;
    background-color: transparent;
  }

  ul[data-checked="true"] {
    font-weight: bold;
    color: green;
  }

  ul[data-checked="false"] {
    color: gray;
    text-decoration: line-through;
  }

  ul[data-checked="true"] li {
    color: green;
  }

  ul[data-checked="false"] li {
    color: gray;
    text-decoration: line-through;
  }

  [data-checked="true"] li::before {
  content: "\xb9"; /* Unicode character for checkbox */
  display: inline-block;
  width: 16px;
  height: 16px;
  vertical-align: middle;
}`;

  // Include these styles in the Juice options
  const juiceOptions = { extraCss: quillStyles };

  io.on("connection", (socket) => {
    // console.log("A user connected");

    socket.on("disconnect", () => {
      // console.log("A user disconnected");
    });
  });

  app.get("/lastbouncedemails", async (req, res) => {
    try {
      const response = await axios.get(
        `https://api.zeptomail.com/v1.1/processed-emails/analytics`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          params: {
            limit: 1, // Get only 1 email
            offset: 0, // Start from the latest email
          },
        }
      );

      res.json({
        lastBouncedEmail: response.data.data[0] || "No bounces found",
      });
    } catch (error) {
      console.log("error", error.message);
      res.status(404).json({ error: error.response?.data || error.message });
    }
  });

  app.post(
    "/sends",
    checkJWTToken,
    upload.array("attachment", 5),
    async (req, res) => {
      try {
        const { recipients, mailContent, subject } = req.body;

        if (!Array.isArray(recipients) || recipients.length === 0) {
          return res.status(400).json({ message: "Please add Recipients." });
        }

        let Content = juice(mailContent, juiceOptions);

        if (!req.files || req.files.length === 0) {
          let client = new SendMailClient({ url, token });

          for (let recipient of recipients) {
            const recipient_object = JSON.parse(recipient);
            client
              .sendMail({
                from: {
                  address: "noreply@labourlaws.co.in",
                  name: "noreply",
                },
                to: [
                  {
                    email_address: {
                      address: recipient_object.address,
                      name: recipient_object.name,
                    },
                  },
                ],
                subject: subject,
                htmlbody: Content,
                // attachments: req.files,
              })
              .then((resp) => console.log("success"))
              .catch((error) => {
                console.log("error sending mail", error);
                return res
                  .status(401)
                  .json(`Email does not exist: ${recipient_object.address}`);
              });
          }

          res.status(200).json({ message: "Emails Sent Successfully!!" });
        } else {
          var attachment_files = [];

          for (let file of req.files) {
            var individual_file = {};

            const filePath = path.join(__dirname, "uploads", file.originalname);
            const fileContent = fs.readFileSync(filePath);

            // Convert the file content to base64
            const encoded = fileContent.toString("base64");
            individual_file["content"] = encoded;
            individual_file["mime_type"] = file.mimetype;
            individual_file["name"] = file.filename;

            attachment_files.push(individual_file);
          }

          let client = new SendMailClient({ url, token });

          for (let recipient of recipients) {
            const recipient_object = JSON.parse(recipient);
            client
              .sendMail({
                from: {
                  address: "noreply@labourlaws.co.in",
                  name: "noreply",
                },
                to: [
                  {
                    email_address: {
                      address: recipient_object.address,
                      name: recipient_object.name,
                    },
                  },
                ],
                subject: subject,
                htmlbody: Content,
                attachments: attachment_files,
              })
              .then((resp) => console.log("success"))
              .catch((error) => {
                // console.log("here", error.error.details);
                res.status(500).json(error);
              });
          }
          res.status(200).json({ message: "Emails Sent Successfully!!" });
        }
      } catch (error) {
        // console.log("catch error", error);
        return res.status(500).json(error.message);
      }
    }
  );

  app.post("/login", async (req, res) => {
    try {
      const { user_email, user_password } = req.body;

      var email_query = "SELECT * FROM user_details WHERE user_email=?";
      const [email_response] = await db.query(email_query, [user_email]);

      if (email_response.length === 0) {
        return res
          .status(401)
          .json({ message: "User Email or Password is invalid" });
      }

      if (email_response[0].password !== user_password) {
        return res
          .status(401)
          .json({ message: "User Email or Password is invalid in pass" });
      }

      const accessToken = jwt.sign(
        {
          username: email_response[0].user_email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10m",
        }
      );

      const refreshToken = jwt.sign(
        {
          username: email_response[0].user_email,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      // console.log(res);

      return res
        .cookie("jwt", refreshToken, {
          httpOnly: true,
          sameSite: "Lax",
          secure: false,
          path: "/",
          maxAge: 24 * 60 * 60 * 1000,
        })
        .json({ accessToken });
    } catch (error) {
      console.log(error);
    }
  });

  app.post("/refresh", async (req, res) => {
    if (req?.cookies?.jwt) {
      // Destructuring refreshToken from cookie
      const refreshToken = req?.cookies.jwt;

      // // console.log(refreshToken)

      // Verifying refresh token
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) {
            // Wrong Refesh Token
            return res.status(406).json({ message: "Unauthorized" });
          } else {
            // Correct token we send a new access token

            var email_query = "SELECT * FROM user_details WHERE user_email=?";
            const [email_response] = await db.query(email_query, [
              decoded.username,
            ]);

            if (email_response.length === 0) {
              return res.status(406).json({ message: "Unauthorized" });
            }

            const accessToken = jwt.sign(
              {
                username: email_response[0].user_email,
              },
              process.env.ACCESS_TOKEN_SECRET,
              {
                expiresIn: "10m",
              }
            );
            return res.json({ accessToken });
          }
        }
      );
    } else {
      return res.status(406).json({ message: "Unauthorized in else" });
    }
  });

  app.post("/logout", (req, res) => {
    res.cookie("jwt", "", {
      httpOnly: true,
      sameSite: "Lax",
      secure: false, // Change to true in production (HTTPS)
      path: "/",
      expires: new Date(0), // Expire the cookie immediately
    });

    return res.json({ message: "Logged out successfully" });
  });

  // app.post("/send", upload.array("attachment", 5), async (req, res) => {
  //   try {
  //     const { recipients, mailContent, subject } = req.body;
  //     const url = "api.zeptomail.com/";
  //     const token =
  //       "Zoho-enczapikey wSsVR60l8hT5C/h1njX5JO9szVUEBgn+Ek4r0Af06Xf8T63Apsc5whfIAwbyGqRJGWRpQTREp+h8m0sC02dahth/mwtRCiiF9mqRe1U4J3x17qnvhDzJW2hUmxKILosKxQpqmWBnE80g+g==";

  //     if (!Array.isArray(recipients) || recipients.length === 0) {
  //       return res
  //         .status(400)
  //         .json({ message: "Recipients list must be a non-empty array." });
  //     }

  //     const Content = juice(mailContent);

  //     const client = new SendMailClient({ url, token });

  //     let attachment_files = [];
  //     if (req.files && req.files.length > 0) {
  //       attachment_files = req.files.map((file) => {
  //         const filePath = path.join(__dirname, "uploads", file.originalname);
  //         const fileContent = fs.readFileSync(filePath);
  //         return {
  //           content: fileContent.toString("base64"),
  //           mime_type: file.mimetype,
  //           name: file.originalname,
  //         };
  //       });
  //     }

  //     const emailPromises = recipients.map((recipient) => {
  //       const recipient_object = JSON.parse(recipient);
  //       return client.sendMail({
  //         from: {
  //           address: "noreply@labourlaws.co.in",
  //           name: "noreply",
  //         },
  //         to: [
  //           {
  //             email_address: {
  //               address: recipient_object.address,
  //               name: recipient_object.name,
  //             },
  //           },
  //         ],
  //         subject,
  //         htmlbody: Content,
  //         attachments: attachment_files,
  //       });
  //     });

  //     await Promise.all(emailPromises);

  //     res.status(200).json({ message: "Emails Sent Successfully!!" });
  //   } catch (error) {
  //     console.error("Error:", error);
  //     res.status(500).json({ message: error.message });
  //   }
  // });

  app.post(
    "/send",
    checkJWTToken,
    upload.array("attachment", 5),
    async (req, res) => {
      try {
        const { recipients, mailContent, subject } = req.body;

        if (!Array.isArray(recipients) || recipients.length === 0) {
          return res
            .status(400)
            .json({ message: "Recipients list must be a non-empty array." });
        }

        const Content = juice(mailContent, juiceOptions);
        const BATCH_SIZE = 50; // Number of emails to send per batch
        const url = "api.zeptomail.com/";
        const token =
          "Zoho-enczapikey wSsVR60l8hT5C/h1njX5JO9szVUEBgn+Ek4r0Af06Xf8T63Apsc5whfIAwbyGqRJGWRpQTREp+h8m0sC02dahth/mwtRCiiF9mqRe1U4J3x17qnvhDzJW2hUmxKILosKxQpqmWBnE80g+g==";

        let attachment_files = [];
        if (req.files && req.files.length > 0) {
          attachment_files = req.files.map((file) => {
            const filePath = path.join(__dirname, "uploads", file.originalname);
            const fileContent = fs.readFileSync(filePath);
            return {
              content: fileContent.toString("base64"),
              mime_type: file.mimetype,
              name: file.originalname,
            };
          });
        }

        const client = new SendMailClient({ url, token });

        const sendEmail = async (recipient) => {
          const recipient_object = JSON.parse(recipient);
          await client.sendMail({
            from: {
              address: "noreply@labourlaws.co.in",
              name: "noreply",
            },
            to: [
              {
                email_address: {
                  address: recipient_object.address,
                  name: recipient_object.name,
                },
              },
            ],
            subject,
            htmlbody: Content,
            attachments: attachment_files,
          });
        };

        for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
          const batch = recipients.slice(i, i + BATCH_SIZE);
          // console.log(`Processing batch ${i / BATCH_SIZE + 1}`);
          await Promise.all(batch.map(sendEmail));
        }

        res.status(200).json({ message: "Emails Sent Successfully!!" });
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: error.message });
      }
    }
  );

  app.get("/", (req, res) => {
    res.json("server is running");
  });

  app.get("/getMails", checkJWTToken, async (req, res) => {
    try {
      const emails = await db.query(
        "SELECT * FROM client_info ORDER_BY company_email ASC"
      );
      res.status(200).json(emails[0]);
    } catch (e) {
      res.status(500).json({
        message: "Some Error Occured, Please Try Again After Sometime",
      });
    }
  });

  app.get("/mails", checkJWTToken, async (req, res) => {
    const query_result = [];

    try {
      // Execute the query (using JOIN or CTE)
      const [companies] = await db.query(`
        SELECT c.id AS company_id,
              c.company_name,
              GROUP_CONCAT(ci.company_email) AS company_emails,
              GROUP_CONCAT(ci.id) AS company_emails_ids
        FROM company c
        LEFT JOIN client_info ci ON c.id = ci.company_id
        GROUP BY c.id, c.company_name ORDER BY c.company_name ASC;
      `);

      // Map the result to include an array of emails
      for (let company of companies) {
        const email_ids = company.company_emails
          ? company.company_emails.split(",")
          : [];
        const idsArray = company.company_emails_ids
          ? company.company_emails_ids.split(",")
          : [];

        const email_id_mapping = email_ids.map((email, index) => ({
          company_email: email,
          id: idsArray[index],
        }));

        const individual_company = {
          id: company.company_id,
          company_name: company.company_name,
          email_ids: email_id_mapping, // Array of emails
        };

        query_result.push(individual_company);
      }

      // Send the result as JSON
      res.status(200).json(query_result);
    } catch (error) {
      console.error("Error during query execution:", error.message);
      res.status(500).json({ message: "Error processing request" });
    }
  });

  app.get("/company", checkJWTToken, async (req, res) => {
    var query = "SELECT * FROM company";
    try {
      const companies = await db.query(query);
      res.status(200).json(companies[0]);
    } catch (err) {
      res.status(500).json({
        message: "Some Error Occured, Please Try Again after sometime!!",
      });
    }
  });

  app.post("/company", checkJWTToken, async (req, res) => {
    const { company_name } = req.body;

    if (company_name == "") {
      res
        .status(500)
        .json({ message: "Data is emptty, please provide valid data!" });
    }

    var checkQuery = "SELECT * FROM company WHERE company_name=?";
    const [checkCompanyResult] = await db.query(checkQuery, [company_name]);

    console.log(checkCompanyResult);

    if (checkCompanyResult.length > 0) {
      res.status(500).json({ message: "Company Already exists!" });
    }

    // // console.log("company_name", company_name);
    var query = "INSERT INTO company (company_name) VALUES(?)";

    try {
      const result = await db.query(query, [company_name.toUpperCase()]);
      io.emit("add_company", company_name.toUpperCase());
      res.status(200).json({ message: "Company Inserted Successfully" });
    } catch (err) {
      // console.log(err);
      res
        .status(500)
        .json({ message: "Some Error Occurred, Please Try Again!" });
    }
  });

  app.delete("/company", checkJWTToken, async (req, res) => {
    const { companyID, company_name } = req.body;

    try {
      var email_delete_query =
        "DELETE FROM client_info WHERE company_id=? RETURNING * ";
      const email_result = await db.query(email_delete_query, [companyID]);

      if (email_result[0].affectedRows > 0) {
        var query = "DELETE FROM company WHERE id=?";
        const result = await db.query(query, [companyID]);
        if (result[0].affectedRows > 0) {
          io.emit("delete_company", company_name);
          res.status(200).json({ message: "Company Deleted Successfully" });
        } else {
          res
            .status(500)
            .json({ message: "Some Error Occurred, Please Try Again!" });
        }
      } else {
        var query = "DELETE FROM company WHERE id=?";
        const result = await db.query(query, [companyID]);
        if (result[0].affectedRows > 0) {
          io.emit("delete_company", company_name);
          res.status(200).json({ message: "Company Deleted Successfully" });
        } else {
          res
            .status(500)
            .json({ message: "Some Error Occurred, Please Try Again!" });
        }
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: "Some Error Occurred, Please Try Again!" });
    }
  });

  app.put("/company", checkJWTToken, async (req, res) => {
    const { companyID, company_name } = req.body;

    var query = "UPDATE company SET company_name=? WHERE id=?";

    try {
      const result = await db.query(query, [
        company_name.toUpperCase(),
        companyID,
      ]);
      io.emit("update_company", company_name);
      res.status(200).json({ message: "Company Name Updated Successfully!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Some Error Occurred, Please Try Again!" });
    }
  });

  app.post("/email", checkJWTToken, async (req, res) => {
    const { company_id, company_email } = req.body;

    try {
      const result = await db.query(
        "INSERT INTO client_info (company_id, company_email) VALUES (?, ?)",
        [company_id, company_email.toLowerCase()]
      );
      if (result[0].affectedRows > 0) {
        res.status(200).json({ message: "Email Created Successfully" });
        io.emit("add_email", company_email);
      } else {
        res
          .status(500)
          .json({ message: "Some Error Occurred, Please Try Again!" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: "Some Error Occurred, Please Try Again!" });
    }
  });

  app.delete("/email", checkJWTToken, async (req, res) => {
    const { id } = req.body;

    try {
      const result = await db.query("DELETE FROM client_info WHERE id=?", [id]);
      if (result[0].affectedRows > 0) {
        io.emit("delete_email", "email");
        res.status(200).json({ message: "Email Deleted Successfully" });
      } else {
        res
          .status(500)
          .json({ message: "Some Error Occurred, Please Try Again!" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: "Some Error Occurred, Please Try Again!" });
    }
  });

  app.post(
    "/upload",
    checkJWTToken,
    upload.single("excelFile"),
    async (req, res) => {
      if (!req.file) {
        return res.status(400).send("No file uploaded");
      }

      try {
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        var insertedCompanies = [];

        // Insert data into MySQL
        for (const row of data) {
          const values = Object.values(row);
          const placeholders = values.map(() => "?").join(", ");
          // console.log(values);

          if (insertedCompanies.includes(values[1])) {
            const get_company_id_query =
              "SELECT id FROM company WHERE company_name=?";
            const [company_id_result] = await db.query(get_company_id_query, [
              values[1].toUpperCase(),
            ]);

            if (insertedCompanies.includes(values[1])) {
              const email_check_query =
                "SELECT * FROM client_info WHERE company_email=?";
              const [email_check_result] = await db.query(email_check_query, [
                values[2].toLowerCase(),
              ]);

              if (email_check_result.length === 0) {
                const insert_email_query =
                  "INSERT INTO client_info (company_id, company_email) VALUES (?, ?)";
                const [insert_email_result] = await db.query(
                  insert_email_query,
                  [company_id_result[0].id, values[2].toLowerCase()]
                );
              }
            }
          } else {
            // // console.log("1");

            // let companyCompareName =  + "%";
            const company_check_query =
              "SELECT * FROM company WHERE company_name=?";
            const [result] = await db.query(company_check_query, [values[1]]);

            // // console.log("2");

            if (result.length == 0) {
              // // console.log("3");

              const company_insert_query =
                "INSERT INTO company (company_name) VALUES(?)";
              const [company_insert_result] = await db.query(
                company_insert_query,
                [values[1].toUpperCase()]
              );
              if (company_insert_result.affectedRows > 0) {
                insertedCompanies.push(values[0]);
              }

              // // console.log("4");

              var company_id = company_insert_result.insertId;

              const email_check_query =
                "SELECT * FROM client_info WHERE company_email=?";
              const [email_check_result] = await db.query(email_check_query, [
                values[2],
              ]);

              // // console.log("5");

              if (email_check_result.length === 0) {
                // // console.log("6");
                const insert_email_query =
                  "INSERT INTO client_info (company_id, company_email) VALUES (?, ?)";
                const [insert_email_result] = await db.query(
                  insert_email_query,
                  [company_id, values[2]]
                );
              }
            } else {
              // // console.log("7");
              const get_company_id_query =
                "SELECT id FROM company WHERE company_name=?";
              const [company_id_result] = await db.query(get_company_id_query, [
                values[1].toUpperCase(),
              ]);

              // // console.log("8");
              if (company_id_result.length > 0) {
                // // console.log("9");
                const email_check_query =
                  "SELECT * FROM client_info WHERE company_email=?";
                const [email_check_result] = await db.query(email_check_query, [
                  values[2],
                ]);

                if (email_check_result.length === 0) {
                  // // console.log("10");
                  const insert_email_query =
                    "INSERT INTO client_info (company_id, company_email) VALUES (?, ?)";
                  const [insert_email_result] = await db.query(
                    insert_email_query,
                    [company_id_result[0].id, values[2].toLowerCase()]
                  );
                }
              }
            }
          }

          if (!insertedCompanies.includes(values[1]))
            insertedCompanies.push(values[1]);
        }
        // // console.log("end");
        res
          .status(200)
          .json({ message: "File uploaded and data inserted successfully" });
      } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).send("Error processing file");
      }
    }
  );

  app.get("/down", checkJWTToken, async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT @rownum:=@rownum+1 as 'Serial Number', c.company_name, ci.company_email AS serial_number FROM (SELECT @rownum:=0) r, client_info ci JOIN company c WHERE c.id=ci.company_id ORDER BY c.company_name ASC"
      );

      if (rows.length === 0) {
        return res.status(404).send("No data found");
      }

      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(rows);
      xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      const filePath = path.join(__dirname, "company_emails.xlsx");
      xlsx.writeFile(workbook, filePath);

      res.download(filePath, "data.xlsx", (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Error downloading file");
        }
        fs.unlinkSync(filePath); // Delete file after sending
      });
    } catch (error) {
      console.error("Error generating Excel file:", error);
      res.status(500).send("Error generating file");
    }
  });

  server.listen(4123, () => {
    // console.log(`Worker ${process.pid} is running on http://localhost:4123`);
  });
};

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  // console.log(`Master process ${process.pid} is running`);
  // console.log(`Forking for ${numCPUs} CPUs`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    // console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  startServer();
}
