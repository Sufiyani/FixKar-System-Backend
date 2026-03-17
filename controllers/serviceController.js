import Service from "../models/Service.js";
import Vendor from "../models/Vendor.js";

// ✅ Create Service
export const createService = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const serviceData = { ...req.body, vendorId };

    const service = await Service.create(serviceData);

    res.status(201).json({
      message: "Service created successfully. Awaiting admin approval.",
      service,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Vendor Services
export const getVendorServices = async (req, res) => {
  try {
    const services = await Service.find({ vendorId: req.vendor._id });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Service
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      vendorId: req.vendor._id,
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Vendor Stats
export const getVendorStats = async (req, res) => {
  try {
    const services = await Service.find({ vendorId: req.vendor._id });

    const stats = {
      totalBookings: 0, // TODO: Implement later
      rating: 4.8,
      earnings: 0, // TODO: Implement later
      activeServices: services.filter((s) => s.status === "Approved").length,
      reviews: 0, // TODO: Implement later
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Vendor Profile
export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id).select("-password");
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};