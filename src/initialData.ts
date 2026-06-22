import { ArrivalRecord, DepartureRecord, EmployeeAttendance } from "./types";

export const initialArrivals: ArrivalRecord[] = [
  {
    id: "arr-1",
    date: "2026-06-10",
    name: "Dela Cruz Party (Juan)",
    pax: 4,
    avail: "RT Transfer + Boracay Tour A",
    number: "0917-123-4567",
    hotel: "Boracay Regency",
    eta: "10:30 AM",
    collect: "PHP 4,500 (Paid)"
  },
  {
    id: "arr-2",
    date: "2026-06-10",
    name: "Mr. Arthur Pendelton",
    pax: 2,
    avail: "Airport Pick-up Only",
    number: "+1-555-0199",
    hotel: "Shangri-La Resort",
    eta: "02:15 PM",
    collect: "PHP 1,800 (Collect)"
  },
  {
    id: "arr-3",
    date: "2026-06-11",
    name: "Santos Family (Maria)",
    pax: 6,
    avail: "RT Transfer + Inland Tour",
    number: "0918-987-6543",
    hotel: "Henann Lagoon Resort",
    eta: "11:00 AM",
    collect: "PHP 7,200 (Collect)"
  },
  {
    id: "arr-4",
    date: "2026-06-12",
    name: "Yamamoto Group",
    pax: 8,
    avail: "Private Van Yacht Charter",
    number: "0905-222-3344",
    hotel: "Crimson Resort",
    eta: "04:30 PM",
    collect: "PHP 15,000 (Paid)"
  },
  {
    id: "arr-5",
    date: "2026-06-12",
    name: "Estrella Couple",
    pax: 2,
    avail: "RT Transfer Only",
    number: "0927-444-5511",
    hotel: "The Lind Boracay",
    eta: "09:00 AM",
    collect: "PHP 1,800 (Paid)"
  }
];

export const initialDepartures: DepartureRecord[] = [
  {
    id: "dep-1",
    date: "2026-06-10",
    name: "Mr. Arthur Pendelton",
    pax: 2,
    avail: "RT Outbound Transfer",
    number: "+1-555-0199",
    hotel: "Shangri-La Resort",
    etd: "05:00 PM",
    pickupTime: "02:00 PM"
  },
  {
    id: "dep-2",
    date: "2026-06-12",
    name: "Dela Cruz Party (Juan)",
    pax: 4,
    avail: "RT Outbound Transfer",
    number: "0917-123-4567",
    hotel: "Boracay Regency",
    etd: "01:30 PM",
    pickupTime: "10:30 AM"
  },
  {
    id: "dep-3",
    date: "2026-06-13",
    name: "Santos Family (Maria)",
    pax: 6,
    avail: "Outbound Only",
    number: "0918-987-6543",
    hotel: "Henann Lagoon Resort",
    etd: "03:00 PM",
    pickupTime: "12:00 PM"
  },
  {
    id: "dep-4",
    date: "2026-06-14",
    name: "Valdez Travel Party",
    pax: 3,
    avail: "RT Outbound Transfer",
    number: "0932-666-7788",
    hotel: "Discovery Shores",
    etd: "10:00 AM",
    pickupTime: "07:00 AM"
  }
];

export const initialPersonnelList: string[] = [
  "Kuya Noel (Driver)",
  "Ate Sarah (Tour Guide)",
  "Kuya Jojo (Coordinator)",
  "Ate Jenny (Guest Relations)",
  "Kuya Caloy (Boat Captain)"
];

export const initialAttendance: EmployeeAttendance[] = [
  {
    id: "emp-1",
    name: "Kuya Noel (Driver)",
    logs: {
      "2026-06-10": { timeIn: "08:00 AM", timeOut: "05:00 PM", location: "Caticlan Airport" },
      "2026-06-11": { timeIn: "07:30 AM", timeOut: "04:30 PM", location: "Hotel Transfers" },
      "2026-06-12": { timeIn: "08:00 AM", timeOut: "06:00 PM", location: "Kalibo Airport" },
      "2026-06-13": { timeIn: "09:00 AM", timeOut: "05:00 PM", location: "Station 1 Lobby" },
      "2026-06-14": { timeIn: "08:00 AM", timeOut: "05:00 PM", location: "Caticlan Airport" }
    }
  },
  {
    id: "emp-2",
    name: "Ate Sarah (Tour Guide)",
    logs: {
      "2026-06-10": { timeIn: "08:30 AM", timeOut: "04:30 PM", location: "Island Tour A" },
      "2026-06-11": { timeIn: "08:30 AM", timeOut: "04:30 PM", location: "Boracay Island Tour" },
      "2026-06-12": { timeIn: "08:00 AM", timeOut: "05:00 PM", location: "Main Office" },
      "2026-06-13": { timeIn: "08:30 AM", timeOut: "04:30 PM", location: "Yacht Cruise Guide" },
      "2026-06-14": { timeIn: "09:00 AM", timeOut: "06:00 PM", location: "Sunset Tour" }
    }
  },
  {
    id: "emp-3",
    name: "Kuya Jojo (Coordinator)",
    logs: {
      "2026-06-10": { timeIn: "07:00 AM", timeOut: "04:00 PM", location: "Caticlan Jetty Port" },
      "2026-06-11": { timeIn: "07:00 AM", timeOut: "04:00 PM", location: "Caticlan Jetty Port" },
      "2026-06-12": { timeIn: "08:00 AM", timeOut: "05:00 PM", location: "Main Office" },
      "2026-06-13": { timeIn: "07:00 AM", timeOut: "04:00 PM", location: "Caticlan Jetty Port" },
      "2026-06-14": { timeIn: "07:00 AM", timeOut: "04:30 PM", location: "Dockside Terminal" }
    }
  },
  {
    id: "emp-4",
    name: "Ate Jenny (Guest Relations)",
    logs: {
      "2026-06-10": { timeIn: "09:00 AM", timeOut: "06:00 PM", location: "Henann Lobby" },
      "2026-06-11": { timeIn: "09:00 AM", timeOut: "06:00 PM", location: "Main Office" },
      "2026-06-12": { timeIn: "09:00 AM", timeOut: "06:00 PM", location: "Shangri-La Lobby" },
      "2026-06-13": { timeIn: "10:00 AM", timeOut: "07:00 PM", location: "Customer Helpdesk" },
      "2026-06-14": { timeIn: "09:00 AM", timeOut: "06:00 PM", location: "Henann Lobby" }
    }
  },
  {
    id: "emp-5",
    name: "Kuya Caloy (Boat Captain)",
    logs: {
      "2026-06-10": { timeIn: "08:00 AM", timeOut: "04:00 PM", location: "Boat Station 3" },
      "2026-06-11": { timeIn: "08:00 AM", timeOut: "04:00 PM", location: "Snorkeling Spot 1" },
      "2026-06-12": { timeIn: "08:00 AM", timeOut: "05:00 PM", location: "Main Office" },
      "2026-06-14": { timeIn: "08:00 AM", timeOut: "04:00 PM", location: "Yacht Pier" }
    }
  }
];
