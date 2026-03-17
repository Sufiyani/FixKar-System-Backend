import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const vendorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
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
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Disapproved"],
      default: "Disapproved",
    },
    availabilityStatus: {
      type: String,
      enum: ["available", "busy"],
      default: "available",
    },
  },
  { timestamps: true }
);

vendorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

vendorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;



// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const vendorSchema = mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     phone: {
//       type: String,
//       required: true,
//     },
//     category: {
//       type: String,
//       required: true,
//     },
//     location: {
//       type: String,
//       required: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["Pending", "Approved", "Disapproved"],
//       default: "Disapproved",
//     },
//     availabilityStatus: {
//       type: String,
//       enum: ["available", "busy"],
//       default: "available",
//     },
//   },
//   { timestamps: true }
// );

// // Password hashing
// vendorSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// vendorSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// // ⭐ Auto-delete services when vendor is deleted via API
// vendorSchema.pre("findOneAndDelete", async function (next) {
//   try {
//     const Service = mongoose.model("Service");
//     const Booking = mongoose.model("Booking");
    
//     const vendor = await this.model.findOne(this.getFilter());
    
//     if (vendor) {
//       await Service.deleteMany({ vendorId: vendor._id });
//       await Booking.deleteMany({ vendorId: vendor._id });
//       console.log(`✅ Deleted services & bookings for vendor: ${vendor._id}`);
//     }
    
//     next();
//   } catch (error) {
//     console.error("Error in vendor deletion middleware:", error);
//     next(error);
//   }
// });

// const Vendor = mongoose.model("Vendor", vendorSchema);
// export default Vendor;