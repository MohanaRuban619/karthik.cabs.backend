require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Use correct middleware order
app.use(cors()); 
app.use(express.json()); // ✅ Proper JSON body parsing middleware
app.use(express.urlencoded({ extended: true })); // ✅ Ensure form data is also handled

// Rate Limiting: Max 5 requests per 5 minutes per IP
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 5, 
  message: { error: "Too many requests, please try again later." },
});

app.use("/contact-email", limiter);

// ✅ Debug Incoming Request
app.post("/contact-email", async (req, res) => {
  console.log("Received Headers:", req.headers);
  console.log("Received Body:", req.body);

  const { name, email, contact, message, subject } = req.body;

  if (!name || !email || !contact || !message) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.OWNER_EMAIL, 
        pass: process.env.OWNER_PASS, 
      },
    });

    const mailOptions = {
      from: process.env.OWNER_EMAIL,
      to: process.env.OWNER_EMAIL,
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nContact: ${contact}\nSubject: ${subject}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: "Message sent successfully!" });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
