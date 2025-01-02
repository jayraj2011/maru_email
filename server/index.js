import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";

const app = express();
app.use(express.json());
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

app.post("/send", (req, res) => {
  try {
    const { recipients } = req.body;
    console.log("recipients", recipients);

    if (!recipients || !recipients.length) {
      return res.status(400).json({ message: "Recipients list is required." });
    }

    const mailOptions = {
      from: '"jayrajb95@gmail.com" <your-email@gmail.com>',
      to: recipients.join(","),
      subject: "Welcome to Our Service",
      html: emailTemplate,
      // attachments: [
      //   {
      //     filename: "welcome-guide.pdf",
      //     contentType: "application/pdf",
      //   },
      // ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send({ message: "Error sending email", error });
      }
      console.log("Email sent:", info.response);
      res.status(200).send({ message: "Email sent successfully!" });
    });
  } catch (error) {
    console.log(error);
    res.send(500).json(error.message);
  }
});

app.get("/", (req, res) => {
  res.json("server is running");
});

app.listen(4123, () => {
  console.log("server is running");
});
