import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Get JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl, adminInviteToken } =
      req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Determine user role: Admin if correct token is provided, otherwise Member
    let role = "member";
    if (
      adminInviteToken &&
      adminInviteToken === process.env.ADMIN_INVITE_TOKEN
    ) {
      role = "admin";
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
      role,
    });

    // Return user data with JWT
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error 🔴", error: error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Return user data with JWT
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error 🔴", error: error.message });
  }
};

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private (Requires JWT)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error 🔴", error: error.message });
  }
};

// @desc Update profile
// @route PUT /api/auth/profile
// @access Private (Requires JWT)
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error 🔴", error: error.message });
  }
};

// 2. Controller คืออะไร?
// เป็น ฟังก์ชันที่จัดการกับ logic ของ route นั้น ๆ
// ทำหน้าที่รับ request, ประมวลผลข้อมูล (เช่น อ่านฐานข้อมูล, คำนวณ), แล้วส่ง response กลับ client
// ไม่ต้องเรียก next() เพราะถือเป็นจุดสิ้นสุดของการตอบกลับ
// มักแยกเก็บในไฟล์ controller เพื่อให้โค้ดเป็นระเบียบ

// | ประเภท         | หน้าที่หลัก                                | รูปแบบพารามิเตอร์                    | เรียก `next()` ไหม?         | ตำแหน่งใช้งาน              |
// | -------------- | ------------------------------------------ | ------------------------------------ | --------------------------- | -------------------------- |
// | **Middleware** | จัดการขั้นกลาง (เช็ค token, แก้ไข request) | `(req, res, next)`                   | ต้องเรียกเพื่อไปต่อ         | ก่อน controller หรือ route |
// | **Controller** | จัดการ logic ของ route (ตอบกลับ client)    | `(req, res)` หรือ `(req, res, next)` | โดยปกติไม่เรียก (ตอบกลับจบ) | จุดสิ้นสุด route handler   |
