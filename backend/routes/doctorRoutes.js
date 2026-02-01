import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Patient } from "../models/Patient.js";
import { Schedule } from "../models/Schedule.js";

const router = express.Router();

dotenv.config();

const decodeDoctorToken = (token, res) => {
  if (!token) {
    res.status(401).json({ message: "Access denied: token required" });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "doctor") {
      res.status(403).json({ message: "Forbidden: doctor only" });
      return null;
    }
    return decoded;
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
    return null;
  }
};

// View all patients linked to the doctor
router.get("/my-patients", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = decodeDoctorToken(token, res);
    if (!decoded) return;

    const patients = await Patient.find({ doctor_id: decoded.id });
    
    // Format patients with userId
    const formattedPatients = patients.map(patient => ({
      _id: patient._id,
      oderId: patient.userId || patient._id.toString().slice(-6),
      name: patient.name,
      email: patient.email,
      role: patient.role,
      createdAt: patient.createdAt
    }));
    
    res.json(formattedPatients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ➕ Add Patient (creates Patient document)
router.post("/add-patient", async (req, res) => {
  try {
    const { token, fullname, email, password } = req.body;
    const decoded = decodeDoctorToken(token, res);
    if (!decoded) return;

    const existing = await Patient.findOne({ email });
    if (existing) return res.status(400).json({ message: "Patient already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const patient = await Patient.create({
      name: fullname,
      email,
      password: hashed,
      doctor_id: decoded.id,
      admin_id: decoded.admin_id || null
    });

    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Remove Patient (only by the doctor who added them)
router.delete("/remove-patient/:id", async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = decodeDoctorToken(token, res);
    if (!decoded) return;

    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Only allow removal if doctorId matches
    if (String(patient.doctor_id) !== String(decoded.id)) {
      return res.status(403).json({ message: "Forbidden: only the doctor who added can remove" });
    }

  // Remove Patient document
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all appointments for the doctor
router.get("/appointments", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = decodeDoctorToken(token, res);
    if (!decoded) return;

    const appointments = await Schedule.find({ doctor_id: decoded.id })
      .populate('patient_id', 'name email')
      .sort({ appointmentDate: -1 })
      .lean();

    const formattedAppointments = appointments.map(appt => ({
      id: appt._id,
      patientId: appt.patient_id?._id,
      patientName: appt.patient_id?.name || 'Unknown Patient',
      patientEmail: appt.patient_id?.email,
      appointmentDate: appt.appointmentDate.toISOString().split('T')[0],
      appointmentTime: appt.appointmentDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }),
      notes: appt.notes,
      status: appt.status
    }));

    res.json({
      success: true,
      appointments: formattedAppointments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Schedule a new appointment
router.post("/appointments", async (req, res) => {
  try {
    const { token, patientId, appointmentDate, appointmentTime, notes } = req.body;
    const decoded = decodeDoctorToken(token, res);
    if (!decoded) return;

    // Check if slot is available
    const existingAppointment = await Schedule.findOne({
      doctor_id: decoded.id,
      appointmentDate: new Date(`${appointmentDate}T${appointmentTime}`),
      status: { $in: ['scheduled', 'rescheduled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        success: false, 
        message: "This time slot is already booked" 
      });
    }

    const appointment = await Schedule.create({
      doctor_id: decoded.id,
      patient_id: patientId,
      appointmentDate: new Date(`${appointmentDate}T${appointmentTime}`),
      notes: notes || "",
      status: "scheduled"
    });

    res.status(201).json({
      success: true,
      appointment,
      message: "Appointment scheduled successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update appointment status
router.put("/appointments/:id", async (req, res) => {
  try {
    const { token, status, notes } = req.body;
    const decoded = decodeDoctorToken(token, res);
    if (!decoded) return;

    const appointment = await Schedule.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (String(appointment.doctor_id) !== String(decoded.id)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    appointment.status = status || appointment.status;
    appointment.notes = notes !== undefined ? notes : appointment.notes;
    await appointment.save();

    res.json({
      success: true,
      appointment,
      message: "Appointment updated successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete/Cancel appointment
router.delete("/appointments/:id", async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = decodeDoctorToken(token, res);
    if (!decoded) return;

    const appointment = await Schedule.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (String(appointment.doctor_id) !== String(decoded.id)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get doctor's schedule/availability
router.get("/availability", async (req, res) => {
  try {
    const { token, date } = req.query;
    const decoded = decodeDoctorToken(token, res);
    if (!decoded) return;

    // Get all booked slots for the date
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const bookedAppointments = await Schedule.find({
      doctor_id: decoded.id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'rescheduled'] }
    }).lean();

    // Generate all time slots (9 AM - 5 PM, 30-min intervals)
    const allSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        allSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }

    const bookedSlots = bookedAppointments.map(appt => 
      appt.appointmentDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      })
    );

    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      success: true,
      date,
      allSlots,
      bookedSlots,
      availableSlots,
      appointments: bookedAppointments.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
