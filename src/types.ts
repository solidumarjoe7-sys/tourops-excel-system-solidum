export interface ArrivalRecord {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  pax: number;
  avail: string; // Availability (e.g., RT Transfer, Tour A)
  number: string; // Contact Number
  hotel: string;
  eta: string; // Estimated Time of Arrival
  collect: string; // Payment/Collect amount
  epay?: string; // Electronic payment details (Gcash, bank, etc.)
  activities?: string; // Standard or requested optional activities
  local?: string; // Number or details of domestic guests
  foreign?: string; // Number or details of international guests
  discounted?: string; // Number or details of senior citizens / pwd/ kids with discount
}

export interface DepartureRecord {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  pax: number;
  avail: string; // Availability (e.g., RT Transfer)
  number: string; // Contact Number
  hotel: string;
  etd: string; // Estimated Time of Departure
  pickupTime: string; // Pickup Time
  page?: string;
  leadGuest?: string;
  unit?: string;
  others?: string;
}

export interface AttendanceDayLog {
  timeIn: string; // e.g., "08:00"
  timeOut: string; // e.g., "17:00"
  location: string; // e.g., "Airport", "Hotel Lobby", "Port"
  status?: string; // "DUTY" | "DAY OFF" | "HALF DAY"
}

export interface EmployeeAttendance {
  id: string;
  name: string;
  // Map of YYYY-MM-DD date strings to daily log info
  logs: {
    [date: string]: AttendanceDayLog;
  };
}

export type Language = 'en' | 'tl';

