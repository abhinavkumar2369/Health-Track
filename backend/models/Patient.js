import mongoose from "mongoose";

// Generate unique 6-digit ID
const generate6DigitId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const patientSchema = new mongoose.Schema(
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
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    role: { type: String, default: "patient" }
  },
  { timestamps: true }
);

// Ensure unique userId before save
patientSchema.pre('save', async function(next) {
  if (this.isNew && !this.userId) {
    let unique = false;
    while (!unique) {
      const newId = generate6DigitId();
      const existing = await mongoose.models.Patient.findOne({ userId: newId });
      if (!existing) {
        this.userId = newId;
        unique = true;
      }
    }
  }
  next();
});

export const Patient = mongoose.model("Patient", patientSchema, "patient");
