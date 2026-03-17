import Admin from "../models/Admin.js";
import Service from "../models/Service.js";
import Vendor from "../models/Vendor.js";
import Booking from "../models/Booking.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";

// ✅ Create default admin (run once)
export const createAdmin = async () => {
  try {
    console.log("✅ Admin check skipped - using existing admin from database");
  } catch (error) {
    console.error("Error creating admin:", error);
  }
};

// ✅ Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { name, password } = req.body;

    const admin = await Admin.findOne({ name });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      accessToken,
      admin: {
        id: admin._id,
        name: admin.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const jwt = (await import("jsonwebtoken")).default;
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const newAccessToken = generateAccessToken(admin._id);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// ✅ Get Pending Services
export const getPendingServices = async (req, res) => {
  try {
    const services = await Service.find({ status: "Pending" }).populate(
      "vendorId",
      "name email phone location"
    );
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Approve Service - Updates vendor status to "Approved"
export const approveService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { status: "Approved" },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Update vendor status to "Approved" if this is their first approved service
    await Vendor.findByIdAndUpdate(
      service.vendorId,
      { status: "Approved" },
      { new: true }
    );

    res.json({ message: "Service approved successfully", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Disapprove Service - Deletes service and updates vendor status if needed
export const disapproveService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Check if vendor has any other approved services
    const remainingApprovedServices = await Service.countDocuments({
      vendorId: service.vendorId,
      status: "Approved"
    });

    // If no approved services remain, set vendor status back to "Pending"
    if (remainingApprovedServices === 0) {
      await Vendor.findByIdAndUpdate(
        service.vendorId,
        { status: "Pending" },
        { new: true }
      );
    }

    res.json({ message: "Service disapproved and deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Approved Services (Public) - WITH NULL VENDOR FILTER
export const getApprovedServices = async (req, res) => {
  try {
    const services = await Service.find({ status: "Approved" }).populate(
      "vendorId",
      "name email phone location availabilityStatus"
    );
    
    // ✅ PERMANENT FIX: Filter out services where vendor doesn't exist
    const validServices = services.filter(service => service.vendorId !== null);
    
    res.json(validServices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Vendors - Only returns vendors with at least one approved service
export const getAllVendors = async (req, res) => {
  try {
    // Only return vendors with status "Approved" (i.e., vendors with approved services)
    const vendors = await Vendor.find({ status: "Approved" }).select("-password");
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Vendor
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Delete all services by this vendor
    await Service.deleteMany({ vendorId: req.params.id });

    res.json({ message: "Vendor and their services deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId")
      .populate("vendorId")
      .populate("serviceId")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Admin Stats - Only counts approved vendors
export const getAdminStats = async (req, res) => {
  try {
    // Only count vendors with status "Approved"
    const totalVendors = await Vendor.countDocuments({ status: "Approved" });
    const availableVendors = await Vendor.countDocuments({ 
      status: "Approved",
      availabilityStatus: "available" 
    });
    const busyVendors = await Vendor.countDocuments({ 
      status: "Approved",
      availabilityStatus: "busy" 
    });
    
    const pendingServices = await Service.countDocuments({ status: "Pending" });
    const approvedServices = await Service.countDocuments({ status: "Approved" });
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "Pending" });
    const confirmedBookings = await Booking.countDocuments({ status: "Confirmed" });
    const completedBookings = await Booking.countDocuments({ status: "Completed" });

    res.json({
      totalVendors,
      availableVendors,
      busyVendors,
      pendingServices,
      approvedServices,
      totalServices,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};