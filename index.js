require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://e-commerce-oolj.vercel.app"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});


// ✅ MongoDB Connection (IMPORTANT)
mongoose.set("strictQuery", false);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch(err => console.log("❌ MongoDB Error:", err));


// user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model("User", userSchema);


// signup
app.post("/Signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await new User({ name, email, password: hashedPassword }).save();

    res.json({ success: true, message: "Signup successful" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// login
app.post("/Login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// start server
app.listen(process.env.PORT || 5000, () => {
  console.log("🚀 Server running");
});
