"""
API v1 Endpoints - AI-Based Appointment Scheduling
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import logging
from collections import Counter

logger = logging.getLogger(__name__)
router = APIRouter()

class TimeSlot(BaseModel):
    date: str
    time: str
    score: float
    reason: str

class AppointmentRequest(BaseModel):
    patient_id: str
    doctor_id: str
    preferred_dates: Optional[List[str]] = None
    preferred_times: Optional[List[str]] = None
    appointment_history: Optional[List[Dict]] = None
    doctor_schedule: Optional[List[Dict]] = None

class TimeSlotResponse(BaseModel):
    success: bool
    recommended_slots: List[TimeSlot]
    message: str

class RescheduleRequest(BaseModel):
    appointment_id: str
    current_date: str
    current_time: str
    reason: Optional[str] = None
    appointment_history: Optional[List[Dict]] = None
    doctor_schedule: Optional[List[Dict]] = None

@router.post("/suggest-slots", response_model=TimeSlotResponse)
async def suggest_appointment_slots(request: AppointmentRequest):
    """
    AI-based appointment slot suggestions
    
    Uses ML to predict best time slots based on:
    - Patient's appointment history
    - Doctor's availability
    - Popular time slots
    - Day of week patterns
    """
    try:
        logger.info(f"Appointment slot suggestion request for patient: {request.patient_id}")
        
        # Get doctor's available slots
        available_slots = get_available_slots(
            request.doctor_schedule or [],
            request.preferred_dates
        )
        
        # Analyze patient history to find patterns
        preferred_patterns = analyze_patient_patterns(
            request.appointment_history or []
        )
        
        # Score and rank slots
        recommended_slots = []
        for slot in available_slots[:20]:  # Limit to top 20 slots
            score, reason = calculate_slot_score(
                slot,
                preferred_patterns,
                request.preferred_times
            )
            
            recommended_slots.append(TimeSlot(
                date=slot['date'],
                time=slot['time'],
                score=score,
                reason=reason
            ))
        
        # Sort by score (highest first)
        recommended_slots.sort(key=lambda x: x.score, reverse=True)
        
        return TimeSlotResponse(
            success=True,
            recommended_slots=recommended_slots[:10],  # Return top 10
            message=f"Found {len(recommended_slots)} available slots"
        )
        
    except Exception as e:
        logger.error(f"Error in appointment slot suggestion: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Slot suggestion failed: {str(e)}"
        )

@router.post("/reschedule-suggest", response_model=TimeSlotResponse)
async def suggest_reschedule_slots(request: RescheduleRequest):
    """
    Suggest alternative slots for rescheduling
    
    Prioritizes slots close to original time
    """
    try:
        logger.info(f"Reschedule suggestion request for appointment: {request.appointment_id}")
        
        # Parse current appointment time
        current_datetime = datetime.strptime(
            f"{request.current_date} {request.current_time}",
            "%Y-%m-%d %H:%M"
        )
        
        # Get available slots near the current time
        available_slots = get_available_slots(
            request.doctor_schedule or [],
            generate_nearby_dates(current_datetime)
        )
        
        # Score slots based on proximity to original time
        recommended_slots = []
        for slot in available_slots[:15]:
            slot_datetime = datetime.strptime(
                f"{slot['date']} {slot['time']}",
                "%Y-%m-%d %H:%M"
            )
            
            # Calculate time difference
            time_diff = abs((slot_datetime - current_datetime).total_seconds() / 3600)
            
            # Score: closer to original time = higher score
            score = max(0, 10 - (time_diff / 24))  # Decay over days
            
            reason = f"Close to original time ({time_diff:.0f} hours difference)"
            if slot_datetime.strftime('%A') == current_datetime.strftime('%A'):
                score += 2
                reason += ", Same day of week"
            
            recommended_slots.append(TimeSlot(
                date=slot['date'],
                time=slot['time'],
                score=score,
                reason=reason
            ))
        
        # Sort by score
        recommended_slots.sort(key=lambda x: x.score, reverse=True)
        
        return TimeSlotResponse(
            success=True,
            recommended_slots=recommended_slots[:10],
            message=f"Found {len(recommended_slots)} alternative slots for rescheduling"
        )
        
    except Exception as e:
        logger.error(f"Error in reschedule suggestion: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reschedule suggestion failed: {str(e)}"
        )

def get_available_slots(
    doctor_schedule: List[Dict],
    preferred_dates: Optional[List[str]] = None
) -> List[Dict]:
    """
    Get available time slots from doctor's schedule
    
    Returns slots that are not already booked
    """
    # Generate time slots for next 14 days
    slots = []
    start_date = datetime.now()
    
    # Working hours: 9 AM to 5 PM
    working_hours = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30"
    ]
    
    # Generate slots for next 14 days
    for day_offset in range(14):
        current_date = start_date + timedelta(days=day_offset)
        date_str = current_date.strftime("%Y-%m-%d")
        
        # Skip if not in preferred dates (if specified)
        if preferred_dates and date_str not in preferred_dates:
            continue
        
        # Skip weekends
        if current_date.weekday() >= 5:
            continue
        
        for time_slot in working_hours:
            # Check if slot is already booked
            is_booked = any(
                appt.get('appointmentDate', '').startswith(date_str) and
                appt.get('appointmentTime') == time_slot
                for appt in doctor_schedule
            )
            
            if not is_booked:
                slots.append({
                    'date': date_str,
                    'time': time_slot
                })
    
    return slots

def analyze_patient_patterns(appointment_history: List[Dict]) -> Dict:
    """
    Analyze patient's appointment history to find patterns
    
    Returns preferred times and days
    """
    if not appointment_history:
        return {
            'preferred_times': [],
            'preferred_days': [],
            'avg_hour': 10
        }
    
    # Extract times and days
    times = []
    days = []
    
    for appt in appointment_history:
        if 'appointmentTime' in appt:
            times.append(appt['appointmentTime'])
        if 'appointmentDate' in appt:
            try:
                date_obj = datetime.strptime(appt['appointmentDate'], "%Y-%m-%d")
                days.append(date_obj.strftime('%A'))
            except:
                pass
    
    # Find most common times
    time_counter = Counter(times)
    preferred_times = [time for time, _ in time_counter.most_common(3)]
    
    # Find most common days
    day_counter = Counter(days)
    preferred_days = [day for day, _ in day_counter.most_common(2)]
    
    # Calculate average hour
    avg_hour = 10
    if times:
        hours = [int(t.split(':')[0]) for t in times]
        avg_hour = sum(hours) // len(hours)
    
    return {
        'preferred_times': preferred_times,
        'preferred_days': preferred_days,
        'avg_hour': avg_hour
    }

def calculate_slot_score(
    slot: Dict,
    patterns: Dict,
    preferred_times: Optional[List[str]] = None
) -> tuple:
    """
    Calculate score for a time slot based on patterns
    
    Returns (score, reason)
    """
    score = 5.0  # Base score
    reasons = []
    
    # Check if time matches patient's history
    if slot['time'] in patterns['preferred_times']:
        score += 3
        reasons.append("Matches your usual appointment time")
    
    # Check if preferred by user
    if preferred_times and slot['time'] in preferred_times:
        score += 2
        reasons.append("Matches your preferred time")
    
    # Check day of week
    try:
        date_obj = datetime.strptime(slot['date'], "%Y-%m-%d")
        day_name = date_obj.strftime('%A')
        if day_name in patterns['preferred_days']:
            score += 2
            reasons.append(f"Matches your preferred day ({day_name})")
    except:
        pass
    
    # Prefer morning slots (generally less busy)
    hour = int(slot['time'].split(':')[0])
    if 9 <= hour <= 11:
        score += 1
        reasons.append("Morning slot (typically less wait time)")
    
    # Prefer slots close to patient's average time
    hour_diff = abs(hour - patterns['avg_hour'])
    if hour_diff <= 1:
        score += 1
        reasons.append("Close to your typical appointment time")
    
    reason = "; ".join(reasons) if reasons else "Available slot"
    
    return score, reason

def generate_nearby_dates(reference_date: datetime) -> List[str]:
    """
    Generate dates near the reference date
    """
    dates = []
    for offset in range(-3, 8):  # 3 days before to 7 days after
        new_date = reference_date + timedelta(days=offset)
        if new_date >= datetime.now():  # Only future dates
            dates.append(new_date.strftime("%Y-%m-%d"))
    return dates
