import mongoose from "mongoose";

// Generate unique 6-digit ID
const generate6DigitId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const adminSchema = new mongoose.Schema(
  {
    userId: { 
      type: String, 
      unique: true, 
      default: generate6DigitId,
      index: true 
    },
    fullname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    phone: { type: String, default: "" },
    apiToken: { type: String, default: "" },
    apiTokenExpiry: { type: Date, default: null }
  },
  { timestamps: true }
);

// Ensure unique userId before save
adminSchema.pre('save', async function(next) {
  if (this.isNew && !this.userId) {
    let unique = false;
    while (!unique) {
      const newId = generate6DigitId();
      const existing = await mongoose.models.Admin.findOne({ userId: newId });
      if (!existing) {
        this.userId = newId;
        unique = true;
      }
    }
  }
  next();
});

export const Admin = mongoose.model("Admin", adminSchema, "admin");
