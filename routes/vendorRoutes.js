import express from "express";
import { 
  registerVendor, 
  loginVendor, 
  updateAvailability,
  getVendorProfile,
  updateVendorProfile
} from "../controllers/vendorController.js";
import {
  createService,
  getVendorServices,
  deleteService,
  getVendorStats,
} from "../controllers/serviceController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔐 Vendor authentication (Public routes)
router.post("/register", registerVendor);
router.post("/login", loginVendor);

// 🧑‍💻 Vendor profile (Protected routes)
router.get("/profile", protect, getVendorProfile);
router.put("/profile", protect, updateVendorProfile);
router.put("/availability", protect, updateAvailability);

// 🧾 Vendor services (Protected routes)
router.post("/services", protect, createService);
router.get("/services", protect, getVendorServices);
router.delete("/services/:id", protect, deleteService);

// 📊 Vendor dashboard stats (Protected routes)
router.get("/stats", protect, getVendorStats);

export default router;