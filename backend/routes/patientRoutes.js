import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Schedule } from "../models/Schedule.js";
import { Patient } from "../models/Patient.js";
import { Doctor } from "../models/Doctor.js";
import axios from "axios";

const router = express.Router();
dotenv.config();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// Get all doctors grouped by specialty
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select('name email specialization userId')
      .lean();
    
    // Format doctors with userId
    const formattedDoctors = doctors.map(doc => ({
      ...doc,
      oderId: doc.userId || doc._id.toString().slice(-8)
    }));
    
    // Group doctors by specialization
    const grouped = formattedDoctors.reduce((acc, doctor) => {
      const specialty = doctor.specialization || 'General';
      if (!acc[specialty]) {
        acc[specialty] = [];
      }
      acc[specialty].push(doctor);
      return acc;
    }, {});
    
    res.json({
      success: true,
      doctors: formattedDoctors,
      groupedBySpecialty: grouped,
      specialties: Object.keys(grouped).sort()
    });
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// Get available time slots for a doctor on specific dates
router.post("/available-slots", async (req, res) => {
  try {
    const { doctorId, dates } = req.body;
    
    if (!doctorId || !dates || !Array.isArray(dates)) {
      return res.status(400).json({
        success: false,
        message: "doctorId and dates array are required"
      });
    }
    
    const doctor = await Doctor.findById(doctorId).select('name specialization');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }
    
    // Get available slots for each date
    const slotsPerDate = {};
    for (const date of dates) {
      slotsPerDate[date] = await getAvailableSlots(doctorId, date);
    }
    
    res.json({
      success: true,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization
      },
      slotsPerDate,
      totalSlots: generateTimeSlots().length
    });
  } catch (err) {
    console.error("Error fetching available slots:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

const decodePatientToken = (token, res) => {
  if (!token) {
    res.status(401).json({ message: "Access denied: token required" });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "patient") {
      res.status(403).json({ message: "Forbidden: patient only" });
      return null;
    }
    return decoded;
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
    return null;
  }
};

// Generate time slots from 9 AM to 5 PM (30-minute intervals)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  return slots;
};

// Get available slots for a doctor on a specific date
const getAvailableSlots = async (doctorId, date) => {
  const allSlots = generateTimeSlots();
  
  // Get booked slots for this doctor on this date
  const bookedAppointments = await Schedule.find({
    doctor_id: doctorId,
    appointmentDate: {
      $gte: new Date(date + 'T00:00:00'),
      $lt: new Date(date + 'T23:59:59')
    },
    status: { $in: ['scheduled', 'rescheduled'] }
  }).lean();
  
  const bookedSlots = bookedAppointments.map(appt => 
    new Date(appt.appointmentDate).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    })
  );
  
  return allSlots.filter(slot => !bookedSlots.includes(slot));
};

// Get AI-suggested appointment slots
router.post("/ai-suggest-slots", async (req, res) => {
  try {
    const { token, doctorId, preferredDates, preferredTimes } = req.body;
    const decoded = decodePatientToken(token, res);
    if (!decoded) return;

    // Get patient's appointment history
    const appointmentHistory = await Schedule.find({ 
      patient_id: decoded.id 
    }).lean();

    // Get doctor's existing appointments
    const doctorSchedule = await Schedule.find({ 
      doctor_id: doctorId 
    }).lean();

    // Call ML service for AI suggestions
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/v1/appointments/suggest-slots`, {
      patient_id: decoded.id,
      doctor_id: doctorId,
      preferred_dates: preferredDates,
      preferred_times: preferredTimes,
      appointment_history: appointmentHistory.map(appt => ({
        appointmentDate: appt.appointmentDate.toISOString().split('T')[0],
        appointmentTime: new Date(appt.appointmentDate).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        })
      })),
      doctor_schedule: doctorSchedule.map(appt => ({
        appointmentDate: appt.appointmentDate.toISOString().split('T')[0],
        appointmentTime: new Date(appt.appointmentDate).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        })
      }))
    });

    res.json({
      success: true,
      recommendedSlots: mlResponse.data.recommended_slots,
      message: mlResponse.data.message
    });
  } catch (err) {
    console.error("Error getting AI slot suggestions:", err);
    res.status(500).json({ 
      success: false,
      message: err.message || "Failed to get AI suggestions"
    });
  }
});

// Request appointment
router.post("/request-appointment", async (req, res) => {
  try {
    const { token, doctorId, appointmentDate, appointmentTime, notes } = req.body;
    const decoded = decodePatientToken(token, res);
    if (!decoded) return;

    // Check if slot is still available
    const existing = await Schedule.findOne({
      doctor_id: doctorId,
      appointmentDate: new Date(`${appointmentDate}T${appointmentTime}`)
    });

    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: "This time slot is no longer available" 
      });
    }

    // Create appointment
    const appointment = await Schedule.create({
      patient_id: decoded.id,
      doctor_id: doctorId,
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
    console.error("Error requesting appointment:", err);
    res.status(500).json({ 
      success: false,
      message: err.message || "Failed to schedule appointment"
    });
  }
});

// Get patient's appointments
router.get("/my-appointments", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = decodePatientToken(token, res);
    if (!decoded) return;

    const appointments = await Schedule.find({ 
      patient_id: decoded.id 
    }).populate('doctor_id', 'name specialization').lean();

    res.json({
      success: true,
      appointments
    });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// Cancel appointment
router.delete("/cancel-appointment/:id", async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = decodePatientToken(token, res);
    if (!decoded) return;

    const appointment = await Schedule.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: "Appointment not found" 
      });
    }

    if (String(appointment.patient_id) !== String(decoded.id)) {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized to cancel this appointment" 
      });
    }

    await Schedule.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: "Appointment cancelled successfully" 
    });
  } catch (err) {
    console.error("Error cancelling appointment:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// Get reschedule suggestions with AI
router.post("/reschedule-suggest/:id", async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = decodePatientToken(token, res);
    if (!decoded) return;

    const appointment = await Schedule.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: "Appointment not found" 
      });
    }

    if (String(appointment.patient_id) !== String(decoded.id)) {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    // Get patient's appointment history
    const appointmentHistory = await Schedule.find({ 
      patient_id: decoded.id 
    }).lean();

    // Get doctor's existing appointments
    const doctorSchedule = await Schedule.find({ 
      doctor_id: appointment.doctor_id 
    }).lean();

    // Call ML service for reschedule suggestions
    const currentDate = appointment.appointmentDate.toISOString().split('T')[0];
    const currentTime = new Date(appointment.appointmentDate).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/v1/appointments/reschedule-suggest`, {
      appointment_id: req.params.id,
      current_date: currentDate,
      current_time: currentTime,
      appointment_history: appointmentHistory.map(appt => ({
        appointmentDate: appt.appointmentDate.toISOString().split('T')[0],
        appointmentTime: new Date(appt.appointmentDate).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        })
      })),
      doctor_schedule: doctorSchedule.map(appt => ({
        appointmentDate: appt.appointmentDate.toISOString().split('T')[0],
        appointmentTime: new Date(appt.appointmentDate).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        })
      }))
    });

    res.json({
      success: true,
      currentAppointment: {
        date: currentDate,
        time: currentTime
      },
      recommendedSlots: mlResponse.data.recommended_slots,
      message: mlResponse.data.message
    });
  } catch (err) {
    console.error("Error getting reschedule suggestions:", err);
    res.status(500).json({ 
      success: false,
      message: err.message || "Failed to get reschedule suggestions"
    });
  }
});

// Reschedule appointment
router.put("/reschedule-appointment/:id", async (req, res) => {
  try {
    const { token, newDate, newTime, reason } = req.body;
    const decoded = decodePatientToken(token, res);
    if (!decoded) return;

    const appointment = await Schedule.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: "Appointment not found" 
      });
    }

    if (String(appointment.patient_id) !== String(decoded.id)) {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    // Check if new slot is available
    const existing = await Schedule.findOne({
      doctor_id: appointment.doctor_id,
      appointmentDate: new Date(`${newDate}T${newTime}`),
      _id: { $ne: req.params.id }
    });

    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: "This time slot is no longer available" 
      });
    }

    // Update appointment
    appointment.appointmentDate = new Date(`${newDate}T${newTime}`);
    if (reason) {
      appointment.notes = (appointment.notes || "") + `\nRescheduled: ${reason}`;
    }
    await appointment.save();

    res.json({
      success: true,
      appointment,
      message: "Appointment rescheduled successfully"
    });
  } catch (err) {
    console.error("Error rescheduling appointment:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

export default router;
