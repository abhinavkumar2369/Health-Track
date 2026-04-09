import mongoose from "mongoose";

const MIN_EIGHT_DIGIT_ID = 10000000;
const MAX_EIGHT_DIGIT_ID = 99999999;
const HEALTHCARE_USER_ID_COUNTER_KEY = "patient-doctor-pharmacist-user-id";

const healthcareUserIdCounterSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    sequence: { type: Number, required: true, default: MIN_EIGHT_DIGIT_ID - 1 },
  },
  {
    versionKey: false,
  }
);

const HealthcareUserIdCounter =
  mongoose.models.HealthcareUserIdCounter ||
  mongoose.model(
    "HealthcareUserIdCounter",
    healthcareUserIdCounterSchema,
    "healthcare_user_id_counter"
  );

export const generateUniqueHealthcareUserId = async () => {
  await HealthcareUserIdCounter.updateOne(
    { key: HEALTHCARE_USER_ID_COUNTER_KEY },
    { $setOnInsert: { sequence: MIN_EIGHT_DIGIT_ID - 1 } },
    { upsert: true }
  );

  const counter = await HealthcareUserIdCounter.findOneAndUpdate(
    { key: HEALTHCARE_USER_ID_COUNTER_KEY },
    { $inc: { sequence: 1 } },
    { new: true, lean: true }
  );

  if (!counter) {
    throw new Error("Unable to generate healthcare user ID");
  }

  if (counter.sequence > MAX_EIGHT_DIGIT_ID) {
    throw new Error("All 8-digit healthcare user IDs are exhausted");
  }

  return String(counter.sequence);
};