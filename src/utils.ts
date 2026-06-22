import { ArrivalRecord, DepartureRecord, EmployeeAttendance } from "./types";

/**
 * Downloads a string pattern as a CSV file to the browser.
 */
export function downloadCSV(filename: string, csvContent: string) {
  // Add UTF-8 Byte Order Mark (BOM) so Excel respects UTF-8 encoding (e.g. PHP / ₱ signs)
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports Arrival Records to CSV format
 */
export function exportArrivalsToCSV(arrivals: ArrivalRecord[]) {
  let csv = "DATE,NAME,PAX,AVAILABILITY/TRANSFER,CONTACT NUMBER,HOTEL,ETA,COLLECT/PAYMENT,E-PAY,ACTIVITIES,LOCAL,FOREIGN,DISCOUNTED\r\n";
  
  // Sort by date then name
  const sorted = [...arrivals].sort((a, b) => {
    const dComp = a.date.localeCompare(b.date);
    if (dComp !== 0) return dComp;
    return a.name.localeCompare(b.name);
  });

  sorted.forEach((row) => {
    // Escape cell values with double quotes to prevent commas breaking CSV alignment
    const escapedName = `"${(row.name || "").replace(/"/g, '""')}"`;
    const escapedAvail = `"${(row.avail || "").replace(/"/g, '""')}"`;
    const escapedNumber = `"${(row.number || "").replace(/"/g, '""')}"`;
    const escapedHotel = `"${(row.hotel || "").replace(/"/g, '""')}"`;
    const escapedEta = `"${(row.eta || "").replace(/"/g, '""')}"`;
    const escapedCollect = `"${(row.collect || "").replace(/"/g, '""')}"`;
    const escapedEpay = `"${(row.epay || "").replace(/"/g, '""')}"`;
    const escapedActivities = `"${(row.activities || "").replace(/"/g, '""')}"`;
    const escapedLocal = `"${(row.local || "").replace(/"/g, '""')}"`;
    const escapedForeign = `"${(row.foreign || "").replace(/"/g, '""')}"`;
    const escapedDiscounted = `"${(row.discounted || "").replace(/"/g, '""')}"`;

    csv += `${row.date},${escapedName},${row.pax},${escapedAvail},${escapedNumber},${escapedHotel},${escapedEta},${escapedCollect},${escapedEpay},${escapedActivities},${escapedLocal},${escapedForeign},${escapedDiscounted}\r\n`;
  });

  downloadCSV("Arrival_Records_TourOps.csv", csv);
}

/**
 * Exports Departure Records to CSV format
 */
export function exportDeparturesToCSV(departures: DepartureRecord[]) {
  let csv = "DATE,NAME,PAX,AVAILABILITY/TRANSFER,CONTACT NUMBER,HOTEL,ETD,PICK UP TIME,PAGE,LEAD GUEST,UNIT,OTHERS\r\n";
  
  const sorted = [...departures].sort((a, b) => {
    const dComp = a.date.localeCompare(b.date);
    if (dComp !== 0) return dComp;
    return a.name.localeCompare(b.name);
  });

  sorted.forEach((row) => {
    const escapedName = `"${(row.name || "").replace(/"/g, '""')}"`;
    const escapedAvail = `"${(row.avail || "").replace(/"/g, '""')}"`;
    const escapedNumber = `"${(row.number || "").replace(/"/g, '""')}"`;
    const escapedHotel = `"${(row.hotel || "").replace(/"/g, '""')}"`;
    const escapedEtd = `"${(row.etd || "").replace(/"/g, '""')}"`;
    const escapedPickup = `"${(row.pickupTime || "").replace(/"/g, '""')}"`;
    const escapedPage = `"${(row.page || "").replace(/"/g, '""')}"`;
    const escapedLeadGuest = `"${(row.leadGuest || "").replace(/"/g, '""')}"`;
    const escapedUnit = `"${(row.unit || "").replace(/"/g, '""')}"`;
    const escapedOthers = `"${(row.others || "").replace(/"/g, '""')}"`;

    csv += `${row.date},${escapedName},${row.pax},${escapedAvail},${escapedNumber},${escapedHotel},${escapedEtd},${escapedPickup},${escapedPage},${escapedLeadGuest},${escapedUnit},${escapedOthers}\r\n`;
  });

  downloadCSV("Departure_Records_TourOps.csv", csv);
}

/**
 * Exports Attendance Records to CSV format
 */
export function exportAttendanceToCSV(employees: EmployeeAttendance[], dates: string[]) {
  // Build header row: PERSONNEL | DATE1 IN | DATE1 OUT | DATE1 LOC | DATE2 IN ...
  let headers = "NAME OF PERSONNEL";
  dates.forEach((d) => {
    const formattedDate = formatDateHeader(d);
    headers += `,${formattedDate} (TIME IN),${formattedDate} (TIME OUT),${formattedDate} (LOCATION)`;
  });
  headers += "\r\n";

  let body = "";
  employees.forEach((emp) => {
    const escapedName = `"${emp.name.replace(/"/g, '""')}"`;
    let empRow = escapedName;
    
    dates.forEach((d) => {
      const log = emp.logs[d];
      if (log) {
        const escapedIn = `"${(log.timeIn || "").replace(/"/g, '""')}"`;
        const escapedOut = `"${(log.timeOut || "").replace(/"/g, '""')}"`;
        const escapedLoc = `"${(log.location || "").replace(/"/g, '""')}"`;
        empRow += `,${escapedIn},${escapedOut},${escapedLoc}`;
      } else {
        empRow += ",,,";
      }
    });
    body += empRow + "\r\n";
  });

  downloadCSV("Attendance_Records_TourOps.csv", headers + body);
}

/**
 * Formats a YYYY-MM-DD date to a human readable short date
 * e.g., "2026-06-10" -> "June 10"
 */
export function formatDateLabel(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/**
 * Compact date header for attendance
 * e.g., "2026-06-10" -> "Jun 10"
 */
export function formatDateHeader(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

/**
 * Returns a list of YYYY-MM-DD date strings within a range
 */
export function getDateArray(startDateStr: string, daysCount: number): string[] {
  const result: string[] = [];
  try {
    const parts = startDateStr.split("-");
    if (parts.length !== 3) return [];
    const current = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    
    for (let i = 0; i < daysCount; i++) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      result.push(`${year}-${month}-${day}`);
      current.setDate(current.getDate() + 1);
    }
  } catch (err) {
    console.error("Error creating date array: ", err);
  }
  return result;
}
