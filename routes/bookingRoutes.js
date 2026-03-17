import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getBookingStats,
  getVendorBookings, // NEW
  updateVendorBookingStatus // NEW
} from "../controllers/bookingController.js";
import { protectAdmin, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📝 Public booking creation
router.post("/", createBooking);

// 🔐 Vendor routes (Protected)
router.get("/vendor/my-bookings", protect, getVendorBookings);
router.put("/vendor/:id/status", protect, updateVendorBookingStatus);

// 🔐 Admin-only routes
router.get("/", protectAdmin, getAllBookings);
router.get("/stats", protectAdmin, getBookingStats);
router.get("/:id", protectAdmin, getBookingById);
router.put("/:id/status", protectAdmin, updateBookingStatus);
router.delete("/:id", protectAdmin, deleteBooking);

export default router;