import express from "express";
import {
  loginAdmin,
  refreshToken,
  getPendingServices,
  approveService,
  disapproveService,
  getApprovedServices,
  getAdminStats,
  getAllVendors,
  deleteVendor,
  getAllBookings,
  //  cleanupOrphanedServices
} from "../controllers/adminController.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔐 Admin authentication
router.post("/login", loginAdmin);
router.post("/refresh", refreshToken);

// 🧾 Service management
router.get("/services/pending", protectAdmin, getPendingServices);
router.put("/services/:id/approve", protectAdmin, approveService);
router.delete("/services/:id/disapprove", protectAdmin, disapproveService);
router.get("/services/approved", getApprovedServices);

// 🧑‍💼 Vendor management
router.get("/vendors", protectAdmin, getAllVendors);
router.delete("/vendors/:id", protectAdmin, deleteVendor);

// 📋 Booking management
router.get("/bookings", protectAdmin, getAllBookings);

// 📊 Dashboard stats
router.get("/stats", protectAdmin, getAdminStats);

// 🧹 ONE-TIME CLEANUP ROUTE - ❌ DELETE AFTER USE
// router.post("/cleanup-orphaned-services", protectAdmin, cleanupOrphanedServices);

export default router;