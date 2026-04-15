export type Service = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
};

export type Dentist = {
  id: string;
  name: string;
  specialty: string;
  bio: string;
};

export type Slot = {
  id: string;
  dentistId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  isAvailable: boolean;
};

export type Booking = {
  id: string;
  patientName: string;
  patientPhone: string;
  slotId: string;
};

// Mock Data
export const services: Service[] = [
  { id: "s1", name: "Routine Checkup", description: "Standard dental checkup and cleaning.", durationMinutes: 30 },
  { id: "s2", name: "Teeth Whitening", description: "Professional teeth whitening session.", durationMinutes: 60 },
  { id: "s3", name: "Consultation", description: "Consultation for braces or Invisalign.", durationMinutes: 30 },
];

export const dentists: Dentist[] = [
  { id: "d1", name: "Dr. Sarah Jenkins", specialty: "General Dentistry", bio: "Dr. Jenkins has 15 years of experience in general dentistry." },
  { id: "d2", name: "Dr. Michael Chen", specialty: "Orthodontics", bio: "Dr. Chen specializes in braces and Invisalign." },
];

// Generate some initial available slots for the next few days
const generateInitialSlots = (): Slot[] => {
  const slots: Slot[] = [];
  const times = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];
  
  // Create slots for today and next 2 days
  for (let i = 0; i < 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    dentists.forEach((dentist) => {
      times.forEach((time, index) => {
        slots.push({
          id: `slot_${dentist.id}_${dateStr}_${index}`,
          dentistId: dentist.id,
          date: dateStr,
          time: time,
          // Randomly make some slots unavailable to simulate real world
          isAvailable: Math.random() > 0.3,
        });
      });
    });
  }
  return slots;
};

// In-memory data stores
let mockSlots = generateInitialSlots();
let mockBookings: Booking[] = [];

// DB Operations
export async function getServices(): Promise<Service[]> {
  return services;
}

export async function getDentists(): Promise<Dentist[]> {
  return dentists;
}

export async function checkAvailability(dentistName?: string, dateStr?: string): Promise<Slot[]> {
  let availableSlots = mockSlots.filter(s => s.isAvailable);
  
  if (dentistName) {
    const dentist = dentists.find(d => d.name.toLowerCase().includes(dentistName.toLowerCase()));
    if (dentist) {
      availableSlots = availableSlots.filter(s => s.dentistId === dentist.id);
    }
  }

  if (dateStr) {
    availableSlots = availableSlots.filter(s => s.date === dateStr);
  }

  return availableSlots;
}

export async function bookAppointment(
  patientName: string, 
  patientPhone: string, 
  dentistName: string, 
  dateStr: string, 
  timeStr: string
): Promise<{ success: boolean; message: string; bookingId?: string }> {
  
  const dentist = dentists.find(d => d.name.toLowerCase().includes(dentistName.toLowerCase()));
  if (!dentist) {
    return { success: false, message: `Could not find a dentist named ${dentistName}.` };
  }

  // Find slot
  const slotIndex = mockSlots.findIndex(s => s.dentistId === dentist.id && s.date === dateStr && s.time === timeStr);
  
  if (slotIndex === -1) {
    return { success: false, message: `No slot exists for ${dentist.name} on ${dateStr} at ${timeStr}.` };
  }
  
  if (!mockSlots[slotIndex].isAvailable) {
    return { success: false, message: `The slot for ${dentist.name} on ${dateStr} at ${timeStr} is no longer available.` };
  }

  // Book it
  mockSlots[slotIndex].isAvailable = false;
  
  const booking: Booking = {
    id: `book_${Date.now()}`,
    patientName,
    patientPhone,
    slotId: mockSlots[slotIndex].id,
  };
  
  mockBookings.push(booking);

  return { success: true, message: "Appointment booked successfully!", bookingId: booking.id };
}
