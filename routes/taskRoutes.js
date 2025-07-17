import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import {
  createTask,
  deleteTask,
  getDashboardData,
  getTaskById,
  getTasks,
  getUserDashboardData,
  updateTask,
  updateTaskChecklist,
  updateTaskStatus,
} from "../controllers/taskController.js";

const router = express.Router();

// Task Management Routes
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/", protect, getTasks); // Get all tasks (Admin: all, User: assigned)
router.get("/:id", protect, getTaskById); // Gat task by ID
router.post("/", protect, adminOnly, createTask); // Create a task (Admin Only)
router.put("/:id", protect, updateTask); // Update task details
router.delete("/:id", protect, adminOnly, deleteTask); // Delete a task (Admin Only)
router.put("/:id/status", protect, updateTaskStatus); // Update Task Status
router.put("/:id/todo", protect, updateTaskChecklist); // Update task checklist

export default router;
