import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    appointmentDate: { type: Date, required: true },
    notes: String
  },
  { timestamps: true }
);

export const Schedule = mongoose.model("Schedule", scheduleSchema, "shedule");
