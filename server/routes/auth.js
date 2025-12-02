// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// helper to send verification email
async function sendVerificationEmail(email, code) {
  try {
    await transporter.sendMail({
      from: `"PHENOPREDICT" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your PHENOPREDICT account",
      html: `
        <h2>Your verification code</h2>
        <h1>${code}</h1>
        <p>Expires in 10 minutes.</p>
      `,
    });
  } catch (err) {
    console.error("Error sending verification email:", err);
    throw err;
  }
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, verificationCode: providedCode } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    // Use verification code sent by gateway if present, otherwise generate one
    const otp = providedCode && String(providedCode).trim().length
      ? String(providedCode).trim()
      : Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      name,
      email: normalizedEmail,
      password: hashed,
      verified: false,
      verificationCode: otp,
      verificationExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    await user.save();

    // send email with the final otp we saved (either gateway provided or generated here)
    try {
      await sendVerificationEmail(normalizedEmail, otp);
    } catch (mailErr) {
      // If email fails, optionally you may delete the created user or keep it and let them retry.
      // We'll return success but also log the email error so frontend/backend can be aware.
      console.error("Mail send failed for", normalizedEmail, mailErr);
      return res.status(500).json({ error: "Failed to send verification email" });
    }

    return res.status(201).json({ message: "OTP sent", email: normalizedEmail });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// VERIFY OTP
router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "Email and code required" });

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.verified) return res.status(400).json({ error: "Already verified" });

    // if user has no verificationCode saved, fail
    if (!user.verificationCode) return res.status(400).json({ error: "No OTP stored" });

    if (String(user.verificationCode) !== String(code))
      return res.status(400).json({ error: "Invalid OTP" });

    if (user.verificationExpires && user.verificationExpires < Date.now())
      return res.status(400).json({ error: "OTP expired" });

    user.verified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    return res.json({ message: "Verified successfully" });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (!user.verified) return res.status(400).json({ error: "Verify email first" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY || "dev_secret",
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login success",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
