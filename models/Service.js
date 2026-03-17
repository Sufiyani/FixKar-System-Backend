import mongoose from "mongoose";

const serviceSchema = mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    availability: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Disapproved"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;