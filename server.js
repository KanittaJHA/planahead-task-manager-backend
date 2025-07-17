import express from "express"; // นำเข้า Express.js framework สำหรับสร้างเว็บเซิร์ฟเวอร์
import cors from "cors"; // นำเข้าไลบรารี CORS เพื่อจัดการเรื่องการอนุญาต Cross-Origin Requests
import path from "path"; // นำเข้าโมดูล path สำหรับจัดการกับเส้นทางไฟล์และโฟลเดอร์ (ยังไม่ได้ใช้ในโค้ดนี้)
import dotenv from "dotenv"; // นำเข้า dotenv สำหรับโหลดตัวแปรแวดล้อมจากไฟล์ .env
import connectDB from "./config/db.js"; // นำเข้าฟังก์ชัน connectDB เพื่อเชื่อมต่อฐานข้อมูล MongoDB
import authRoutes from "./routes/authRoutes.js"; // นำเข้าชุด routes สำหรับระบบ authentication
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { fileURLToPath } from "url";

// Fix __dirname for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // โหลดตัวแปรแวดล้อมจากไฟล์ .env มาใช้ใน process.env

const app = express(); // สร้างแอป Express ใหม่

// Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // กำหนด URL ที่อนุญาตให้เข้ามาเรียก API ได้ ถ้าไม่มีกำหนดจะอนุญาตทุกที่ ("*")
    methods: ["GET", "POST", "PUT", "DELETE"], // กำหนด HTTP methods ที่อนุญาต
    allowedHeaders: ["Content-Type", "Authorization"], // กำหนด headers ที่อนุญาตให้ client ส่งมาได้
  })
);

// Connect Database
connectDB(); // เรียกฟังก์ชันเชื่อมต่อกับฐานข้อมูล MongoDB

// Middleware
app.use(express.json()); // เปิดใช้งาน middleware ของ Express เพื่อ parse request body เป็น JSON

// Routes
app.use("/api/auth", authRoutes);
// ตั้งค่าให้เมื่อมี request ไปที่ URL ที่ขึ้นต้นด้วย "api/auth"
// ให้ใช้ router ที่นำเข้าจาก authRoutes.js (เช่น /api/auth/register, /api/auth/login)

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);

// Serve upload folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start Server
const PORT = process.env.PORT || 5000; // กำหนด port ที่จะใช้เซิร์ฟเวอร์ (จาก .env หรือ default 5000)
app.listen(PORT, () => console.log(`Server runnung on port ${PORT} 🟢`));
// เริ่มให้เซิร์ฟเวอร์รับ request บน port ที่กำหนด พร้อมแสดงข้อความใน console
