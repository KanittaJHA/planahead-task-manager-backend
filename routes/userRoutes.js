import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import { getUserById, getUsers } from "../controllers/userController.js";

const router = express.Router();

// User Management Routes
router.get("/", protect, adminOnly, getUsers); // Get all users (Admin Only)
router.get("/:id", protect, getUserById); // Get a specific user

export default router;
