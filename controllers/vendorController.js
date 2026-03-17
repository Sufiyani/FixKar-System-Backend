import Vendor from "../models/Vendor.js";
import { generateAccessToken } from "../utils/generateToken.js";

// ✅ Register Vendor
export const registerVendor = async (req, res) => {
  try {
    const { name, email, phone, category, location, password } = req.body;

    const vendorExists = await Vendor.findOne({ email });
    if (vendorExists) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    const vendor = await Vendor.create({
      name,
      email,
      phone,
      category,
      location,
      password,
    });

    res.status(201).json({
      message: "Vendor registered successfully",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        status: vendor.status,
        availabilityStatus: vendor.availabilityStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Login Vendor
export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await vendor.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(vendor._id);

    res.json({
      message: "Vendor logged in successfully",
      accessToken,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        status: vendor.status,
        availabilityStatus: vendor.availabilityStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Vendor Availability Status
export const updateAvailability = async (req, res) => {
  try {
    const { availabilityStatus } = req.body;

    if (!["available", "busy"].includes(availabilityStatus)) {
      return res.status(400).json({ message: "Invalid availability status" });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.vendor._id,
      { availabilityStatus },
      { new: true }
    ).select("-password");

    res.json({
      message: "Availability updated successfully",
      vendor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Vendor Profile
export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id).select("-password");
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Vendor Profile
export const updateVendorProfile = async (req, res) => {
  try {
    const { name, phone, location, category } = req.body;

    const vendor = await Vendor.findById(req.vendor._id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.name = name || vendor.name;
    vendor.phone = phone || vendor.phone;
    vendor.location = location || vendor.location;
    vendor.category = category || vendor.category;

    await vendor.save();

    res.json({
      message: "Profile updated successfully",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        location: vendor.location,
        category: vendor.category,
        status: vendor.status,
        availabilityStatus: vendor.availabilityStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};