# AI-Based Appointment Scheduling System

## Overview
The Health-Track application now includes an advanced AI-powered appointment scheduling system that helps patients book, reschedule, and manage appointments with intelligent time slot recommendations.

## Features

### 1. **AI-Powered Slot Suggestions**
- Analyzes patient's appointment history to predict preferred times
- Considers historical patterns:
  - Most frequently booked days of the week
  - Most frequently booked times of day
  - Recent appointment trends
- Scores each slot on a scale of 0-10 based on multiple factors
- Prioritizes slots that match patient's historical preferences

### 2. **Smart Appointment Booking**
- Patients can request appointments with AI-recommended time slots
- Each suggested slot includes:
  - Date and time
  - AI confidence score (0-10)
  - Reasoning for the recommendation
- Real-time validation of slot availability
- Automatic conflict detection

### 3. **Intelligent Rescheduling**
- AI suggests alternative slots when rescheduling is needed
- Prioritizes slots close to the original appointment time
- Considers:
  - Proximity to original time (within ±3 days preferred)
  - Patient's historical preferences
  - Day of week matching
- Maintains appointment history with status tracking

### 4. **Appointment Management**
- **View Appointments**: See all scheduled, completed, cancelled, and rescheduled appointments
- **Cancel Appointments**: Cancel with confirmation dialog
- **Reschedule Appointments**: Get AI-suggested alternatives
- **Status Tracking**: Visual badges for appointment status
  - 🟢 Scheduled (green)
  - 🔴 Cancelled (red)
  - 🔵 Completed (blue)
  - 🟡 Rescheduled (yellow)

## Architecture

### Frontend Components
**File**: `frontend/src/pages/PatientDashboard.jsx`

#### State Management
```javascript
- appointments: Array of patient's appointments
- showAppointmentModal: Boolean for booking modal visibility
- aiSuggestedSlots: Array of AI-recommended time slots
- loadingSlots: Boolean for loading state
- bookingAppointment: Boolean for booking in progress
- appointmentMessage: Object for success/error messages
- showRescheduleModal: Boolean for reschedule modal visibility
- rescheduleData: Object containing current appointment and suggested slots
```

#### Key Functions
1. **fetchAppointments()** - Retrieves patient's appointments
2. **handleOpenAppointmentModal()** - Opens booking modal and fetches AI suggestions
3. **handleBookAppointment(slot)** - Books selected time slot
4. **handleCancelAppointment(id)** - Cancels appointment with confirmation
5. **handleOpenRescheduleModal(appointment)** - Opens reschedule modal with AI suggestions
6. **handleRescheduleAppointment(slot)** - Updates appointment to new time slot

### Backend API Endpoints
**File**: `backend/routes/patientRoutes.js`

#### Routes
1. **POST /patient/ai-suggest-slots**
   - Request body: `{ patientId, doctorId }`
   - Returns: AI-recommended time slots with scores and reasoning

2. **POST /patient/request-appointment**
   - Request body: `{ doctorId, date, timeSlot, notes }`
   - Returns: Created appointment or error if slot unavailable

3. **GET /patient/my-appointments**
   - Returns: All appointments for authenticated patient

4. **DELETE /patient/cancel-appointment/:id**
   - Cancels specified appointment
   - Returns: Success message

5. **POST /patient/reschedule-suggest/:id**
   - Returns: AI-suggested alternative slots for rescheduling

6. **PUT /patient/reschedule-appointment/:id**
   - Request body: `{ newDate, newTimeSlot, reason }`
   - Updates appointment to new time
   - Returns: Updated appointment

### ML Microservice
**File**: `ml-microservice/app/api/v1/endpoints/appointment_scheduling.py`

#### AI Algorithm

##### Slot Scoring System (0-10 scale)
```python
Base Score Calculation:
1. Day Match (0-3 points)
   - 3.0: Exact day of week match
   - 1.5: Adjacent day match
   - 0.0: No match

2. Time Match (0-3 points)
   - 3.0: Within 1 hour of preferred time
   - 2.0: Within 2 hours
   - 1.0: Within 3 hours
   - 0.0: Beyond 3 hours

3. Recency Bias (0-2 points)
   - 2.0: Within last 30 days
   - 1.0: Within last 90 days
   - 0.0: Older than 90 days

4. Frequency Bonus (0-2 points)
   - Based on how often patient books similar slots
   - Max 2.0 for most frequent patterns
```

##### Pattern Analysis
```python
analyze_patient_patterns():
- Extracts all past appointments
- Identifies most common days of week
- Identifies most common times of day
- Calculates frequency distributions
- Returns preferred patterns
```

##### Reschedule Logic
```python
suggest_reschedule_slots():
- Prioritizes slots within ±3 days of original
- Scores based on:
  - Proximity to original time (higher weight)
  - Patient's historical preferences
  - Day of week matching
- Returns top 5 alternatives sorted by score
```

#### Endpoints
1. **POST /api/v1/appointments/suggest-slots**
   ```json
   Request: {
     "patient_id": "string",
     "doctor_id": "string",
     "preferred_date": "YYYY-MM-DD" (optional)
   }
   Response: {
     "success": true,
     "recommended_slots": [
       {
         "date": "YYYY-MM-DD",
         "time": "HH:MM",
         "score": 8.5,
         "reason": "Matches your typical Tuesday morning appointments"
       }
     ]
   }
   ```

2. **POST /api/v1/appointments/reschedule-suggest**
   ```json
   Request: {
     "patient_id": "string",
     "current_appointment_id": "string",
     "current_date": "YYYY-MM-DD",
     "current_time": "HH:MM"
   }
   Response: {
     "success": true,
     "current_appointment": {...},
     "recommended_slots": [...]
   }
   ```

## Database Schema
**File**: `backend/models/Schedule.js`

```javascript
{
  patient: ObjectId (ref: 'Patient'),
  doctor: ObjectId (ref: 'Doctor'),
  date: Date,
  timeSlot: String,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## User Interface

### Appointment List View
- Displays all appointments with status badges
- Shows date, time, and doctor information
- Action buttons for scheduled appointments:
  - **Reschedule**: Opens reschedule modal with AI suggestions
  - **Cancel**: Cancels appointment with confirmation

### Booking Modal
- **Header**: "Book Appointment" with AI badge
- **AI Suggestions Section**: 
  - Blue info banner explaining AI recommendations
  - List of suggested slots with:
    - Date and time
    - AI score (color-coded: green ≥8, blue ≥6, yellow <6)
    - Reasoning for recommendation
    - "Book This Slot" button
- **Loading State**: Spinner with "Getting AI recommendations..." message

### Reschedule Modal
- **Header**: "Reschedule Appointment"
- **Current Appointment Display**: Shows current date and time
- **AI Suggestions Section**:
  - Blue info banner explaining close alternatives
  - List of alternative slots with scores and reasoning
  - "Reschedule" button for each option
- **Loading State**: Spinner with "Finding alternative time slots..." message

## AI Scoring Examples

### Example 1: Perfect Match
```
Slot: Tuesday 10:00 AM
Patient History: Usually books Tuesday 10:00 AM
Score: 9.5/10
Reason: "Perfect match with your typical appointment pattern"

Breakdown:
- Day Match: 3.0 (exact Tuesday match)
- Time Match: 3.0 (exact 10:00 AM match)
- Recency: 2.0 (recent appointments)
- Frequency: 1.5 (high frequency)
Total: 9.5
```

### Example 2: Good Match
```
Slot: Wednesday 11:00 AM
Patient History: Usually books Tuesday 10:00 AM
Score: 7.0/10
Reason: "Close to your usual time, adjacent day"

Breakdown:
- Day Match: 1.5 (adjacent day)
- Time Match: 2.0 (within 2 hours)
- Recency: 2.0 (recent appointments)
- Frequency: 1.5 (moderate frequency)
Total: 7.0
```

### Example 3: Average Match
```
Slot: Friday 3:00 PM
Patient History: Usually books Tuesday 10:00 AM
Score: 4.5/10
Reason: "Different from your usual pattern but available"

Breakdown:
- Day Match: 0.0 (no match)
- Time Match: 0.0 (beyond 3 hours)
- Recency: 2.0 (recent appointments)
- Frequency: 0.0 (never booked this pattern)
Total: 2.0 (baseline adjustment brings to 4.5)
```

## Integration Flow

### Booking Flow
```
1. Patient clicks "Book Appointment"
   ↓
2. Frontend calls GET /patient/ai-suggest-slots
   ↓
3. Backend calls ML service POST /api/v1/appointments/suggest-slots
   ↓
4. ML service analyzes patient history and scores slots
   ↓
5. Backend returns ranked suggestions to frontend
   ↓
6. Patient reviews AI recommendations
   ↓
7. Patient selects preferred slot
   ↓
8. Frontend calls POST /patient/request-appointment
   ↓
9. Backend validates availability and creates appointment
   ↓
10. Success confirmation displayed
```

### Rescheduling Flow
```
1. Patient clicks "Reschedule" on existing appointment
   ↓
2. Frontend calls POST /patient/reschedule-suggest/:id
   ↓
3. Backend retrieves current appointment details
   ↓
4. Backend calls ML service POST /api/v1/appointments/reschedule-suggest
   ↓
5. ML service finds alternatives close to original time
   ↓
6. Backend returns suggestions to frontend
   ↓
7. Patient selects new time slot
   ↓
8. Frontend calls PUT /patient/reschedule-appointment/:id
   ↓
9. Backend updates appointment with new time
   ↓
10. Success confirmation displayed
```

## Error Handling

### Frontend
- **Network Errors**: Displays error message in modal
- **No Slots Available**: Shows "No available slots" message
- **Booking Conflicts**: Shows specific error from backend
- **Cancellation**: Requires confirmation dialog

### Backend
- **Invalid Patient/Doctor**: Returns 404 error
- **Slot Already Booked**: Returns 400 error with message
- **Unauthorized Access**: Returns 401 error
- **ML Service Down**: Fallback to default time slots

### ML Service
- **No History**: Returns general time slots without scoring
- **Invalid Data**: Returns 400 error
- **Processing Error**: Returns 500 error with details

## Testing Scenarios

### 1. First-Time User
- No appointment history
- AI suggests popular general time slots
- Lower confidence scores (4-6 range)

### 2. Regular User
- Multiple appointments in history
- AI identifies clear patterns
- High confidence scores (8-10 range)
- Specific reasoning based on history

### 3. Rescheduling
- Slots close to original time prioritized
- AI considers why reschedule might be needed
- Maintains similar day/time if possible

### 4. Cancellation
- Simple cancellation with confirmation
- Status updated to "cancelled"
- Appointment retained in history

## Future Enhancements

1. **Doctor Availability Integration**
   - Real-time availability checking
   - Block unavailable time slots
   - Show doctor's schedule

2. **Multi-Doctor Support**
   - Select from list of doctors
   - AI considers doctor-specific patterns
   - Compare availability across doctors

3. **Appointment Types**
   - Differentiate between consultation types
   - Adjust slot duration based on type
   - Pattern recognition per appointment type

4. **Reminder System**
   - SMS/Email reminders
   - Push notifications
   - Reminder preferences

5. **Waitlist Feature**
   - Join waitlist for fully booked slots
   - Automatic notification when slot opens
   - Priority for rescheduled patients

6. **Advanced ML Features**
   - Predict appointment duration
   - Suggest optimal appointment spacing
   - Seasonal pattern recognition
   - Holiday awareness

## Configuration

### ML Service Settings
```python
# ml-microservice/app/core/config.py
APPOINTMENT_SLOT_DURATION = 30  # minutes
MAX_SLOTS_PER_DAY = 16  # 8 hours
WORKING_HOURS_START = "09:00"
WORKING_HOURS_END = "17:00"
PROXIMITY_WEIGHT = 0.4  # For reschedule suggestions
PATTERN_WEIGHT = 0.6  # For historical patterns
```

### Backend Settings
```javascript
// backend/server.js
ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'
REQUEST_TIMEOUT = 10000  // 10 seconds
```

## Deployment Notes

1. **ML Service**: Deploy on port 8000 (FastAPI)
2. **Backend**: Deploy on port 5000 (Express)
3. **Frontend**: Build with Vite, serve static files
4. **Database**: MongoDB with Schedule, Patient, Doctor collections
5. **CORS**: Configured for cross-origin requests

## Security Considerations

1. **Authentication**: JWT tokens required for all endpoints
2. **Authorization**: Patients can only access their own appointments
3. **Data Validation**: Input sanitization on all requests
4. **Rate Limiting**: Prevent abuse of AI endpoints
5. **Appointment Ownership**: Verify patient owns appointment before actions

---

**Version**: 1.0  
**Last Updated**: 2024  
**Maintainer**: Health-Track Development Team
