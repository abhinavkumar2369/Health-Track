const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

// Email transporter
const transporter = nodemailer.createTransporter({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send appointment reminder email
const sendAppointmentReminder = async (appointment) => {
  try {
    await appointment.populate([
      { path: 'patient', populate: { path: 'user' } },
      { path: 'doctor', populate: { path: 'user' } }
    ]);

    const patientEmail = appointment.patient.user.email;
    const patientName = `${appointment.patient.user.profile.firstName} ${appointment.patient.user.profile.lastName}`;
    const doctorName = `Dr. ${appointment.doctor.user.profile.firstName} ${appointment.doctor.user.profile.lastName}`;
    
    const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString();
    const appointmentTime = appointment.appointmentTime;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: 'Appointment Reminder - Health Track',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5282;">Appointment Reminder</h2>
          <p>Dear ${patientName},</p>
          <p>This is a friendly reminder about your upcoming appointment:</p>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0; color: #2d3748;">Appointment Details</h3>
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Time:</strong> ${appointmentTime}</p>
            <p><strong>Type:</strong> ${appointment.type}</p>
            ${appointment.notes?.patient ? `<p><strong>Notes:</strong> ${appointment.notes.patient}</p>` : ''}
          </div>
          
          <p>Please arrive 15 minutes before your scheduled appointment time.</p>
          <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
          
          <p>Best regards,<br>Health Track Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    // Update reminder status
    appointment.reminder.sent = true;
    appointment.reminder.sentAt = new Date();
    await appointment.save();
    
    console.log(`Reminder sent to ${patientEmail} for appointment on ${appointmentDate}`);
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
  }
};

// Send health tips email
const sendHealthTips = async (patient, tips) => {
  try {
    await patient.populate('user');
    
    const patientEmail = patient.user.email;
    const patientName = `${patient.user.profile.firstName} ${patient.user.profile.lastName}`;

    const tipsHtml = Object.entries(tips).map(([category, tipsList]) => `
      <h3 style="color: #2d3748; text-transform: capitalize;">${category} Tips</h3>
      <ul>
        ${tipsList.map(tip => `<li style="margin-bottom: 8px;">${tip}</li>`).join('')}
      </ul>
    `).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: 'Your Personalized Health Tips - Health Track',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5282;">Your Personalized Health Tips</h2>
          <p>Dear ${patientName},</p>
          <p>Here are some personalized health tips based on your preferences:</p>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${tipsHtml}
          </div>
          
          <p>Remember to consult with your healthcare provider before making any significant changes to your diet or exercise routine.</p>
          
          <p>Stay healthy!<br>Health Track Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Health tips sent to ${patientEmail}`);
  } catch (error) {
    console.error('Error sending health tips:', error);
  }
};

// Schedule appointment reminders (runs every hour)
cron.schedule('0 * * * *', async () => {
  console.log('Checking for appointment reminders...');
  
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find appointments for tomorrow that haven't had reminders sent
    const appointmentsToRemind = await Appointment.find({
      appointmentDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      status: { $in: ['scheduled', 'confirmed'] },
      'reminder.sent': false
    });

    for (const appointment of appointmentsToRemind) {
      await sendAppointmentReminder(appointment);
    }
    
    console.log(`Sent ${appointmentsToRemind.length} appointment reminders`);
  } catch (error) {
    console.error('Error in appointment reminder cron job:', error);
  }
});

// Schedule weekly health tips (runs every Sunday at 9 AM)
cron.schedule('0 9 * * 0', async () => {
  console.log('Sending weekly health tips...');
  
  try {
    const patients = await Patient.find({
      'healthTips.preferences': { $exists: true, $ne: [] }
    }).populate('user');

    const healthTipsDatabase = {
      diet: [
        "Include more fiber-rich foods in your diet",
        "Try to eat the rainbow - colorful fruits and vegetables",
        "Limit processed and packaged foods",
        "Don't skip meals, especially breakfast"
      ],
      exercise: [
        "Take the stairs instead of the elevator",
        "Try a 10-minute morning stretch routine",
        "Park further away to get extra steps",
        "Do bodyweight exercises during TV commercial breaks"
      ],
      yoga: [
        "Start your day with 5 minutes of deep breathing",
        "Try the child's pose for relaxation",
        "Practice gratitude meditation before bed",
        "Use yoga apps for guided sessions"
      ],
      general: [
        "Stay connected with friends and family",
        "Limit screen time before bedtime",
        "Keep a health journal to track progress",
        "Schedule regular check-ups with your doctor"
      ]
    };

    for (const patient of patients) {
      const preferences = patient.healthTips.preferences;
      const personalizedTips = {};
      
      preferences.forEach(pref => {
        if (healthTipsDatabase[pref]) {
          // Select 2-3 random tips from each category
          const tips = healthTipsDatabase[pref];
          const selectedTips = tips.sort(() => 0.5 - Math.random()).slice(0, 3);
          personalizedTips[pref] = selectedTips;
        }
      });

      if (Object.keys(personalizedTips).length > 0) {
        await sendHealthTips(patient, personalizedTips);
        
        // Update last sent date
        patient.healthTips.lastSent = new Date();
        await patient.save();
      }
    }
    
    console.log(`Sent health tips to ${patients.length} patients`);
  } catch (error) {
    console.error('Error in health tips cron job:', error);
  }
});

// AI-powered appointment scheduling suggestions
const getOptimalAppointmentTime = async (doctorId, preferredDate, patientId) => {
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    // Get existing appointments for the doctor on the preferred date
    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: new Date(preferredDate),
      status: { $in: ['scheduled', 'confirmed'] }
    });

    // Get doctor's working hours
    const workingHours = doctor.schedule?.workingHours || { start: '09:00', end: '17:00' };
    const consultationDuration = doctor.schedule?.consultationDuration || 30;

    // Generate available time slots
    const availableSlots = [];
    const startHour = parseInt(workingHours.start.split(':')[0]);
    const startMinute = parseInt(workingHours.start.split(':')[1]);
    const endHour = parseInt(workingHours.end.split(':')[0]);
    const endMinute = parseInt(workingHours.end.split(':')[1]);

    let currentTime = startHour * 60 + startMinute; // Convert to minutes
    const endTime = endHour * 60 + endMinute;

    while (currentTime + consultationDuration <= endTime) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const timeSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      // Check if this slot is available
      const isBooked = existingAppointments.some(apt => apt.appointmentTime === timeSlot);
      
      if (!isBooked) {
        availableSlots.push(timeSlot);
      }

      currentTime += consultationDuration;
    }

    // AI suggestions (simple logic - can be enhanced with ML)
    const suggestions = {
      optimalTime: availableSlots[0] || null,
      alternativeSlots: availableSlots.slice(1, 4),
      reasoning: availableSlots.length > 0 ? 
        'Based on doctor availability and optimal scheduling' : 
        'No available slots for this date'
    };

    return suggestions;
  } catch (error) {
    console.error('Error generating appointment suggestions:', error);
    return null;
  }
};

module.exports = {
  sendAppointmentReminder,
  sendHealthTips,
  getOptimalAppointmentTime
};
