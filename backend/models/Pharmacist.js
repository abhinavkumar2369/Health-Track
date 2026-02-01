import mongoose from "mongoose";

// Generate unique 6-digit ID
const generate6DigitId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const pharmacistSchema = new mongoose.Schema(
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
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    phone: { type: String },
    inventory: { type: [String], default: [] },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    role: { type: String, default: "pharmacist" }
  },
  { timestamps: true }
);

// Ensure unique userId before save
pharmacistSchema.pre('save', async function(next) {
  if (this.isNew && !this.userId) {
    let unique = false;
    while (!unique) {
      const newId = generate6DigitId();
      const existing = await mongoose.models.Pharmacist.findOne({ userId: newId });
      if (!existing) {
        this.userId = newId;
        unique = true;
      }
    }
  }
  next();
});

export const Pharmacist = mongoose.model("Pharmacist", pharmacistSchema, "pharmacist");
