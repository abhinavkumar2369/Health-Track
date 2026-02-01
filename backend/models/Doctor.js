import mongoose from "mongoose";

// Generate unique 6-digit ID
const generate6DigitId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const doctorSchema = new mongoose.Schema(
  {
    userId: { 
      type: String, 
      unique: true, 
      default: generate6DigitId,
      index: true 
    },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    specialization: String,
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    role: { type: String, default: "doctor" }
  },
  { timestamps: true }
);

// Ensure unique userId before save
doctorSchema.pre('save', async function(next) {
  if (this.isNew && !this.userId) {
    let unique = false;
    while (!unique) {
      const newId = generate6DigitId();
      const existing = await mongoose.models.Doctor.findOne({ userId: newId });
      if (!existing) {
        this.userId = newId;
        unique = true;
      }
    }
  }
  next();
});

export const Doctor = mongoose.model("Doctor", doctorSchema, "doctor");
