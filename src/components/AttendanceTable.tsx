import React, { useState } from "react";
import { Trash2, AlertCircle, Plus, ChevronLeft, ChevronRight, Download, Check, X, Clock, MapPin } from "lucide-react";
import { EmployeeAttendance, AttendanceDayLog, Language } from "../types";
import { formatDateHeader, formatDateLabel, getDateArray, exportAttendanceToCSV } from "../utils";
import { translations } from "../translations";

interface AttendanceTableProps {
  employees: EmployeeAttendance[];
  onUpdateAttendance: (employeeId: string, date: string, log: AttendanceDayLog | null) => void;
  onDeleteEmployee: (id: string) => void;
  onUpdateEmployeeName: (id: string, newName: string) => void;
  onAddEmployee: (name: string) => void;
  searchQuery: string;
  language: Language;
  activeLogbookDate: string;
  lockedDates: string[];
}

export default function AttendanceTable({
  employees,
  onUpdateAttendance,
  onDeleteEmployee,
  onUpdateEmployeeName,
  onAddEmployee,
  searchQuery,
  language,
  activeLogbookDate,
  lockedDates
}: AttendanceTableProps) {
  const t = translations[language];
  // Start date for the 7-day view (Default: June 10, 2026, as requested)
  const [anchorDate, setAnchorDate] = useState("2026-06-10");
  const [daysCount] = useState(7); // 7 consecutive days

  const isDateLocked = (d: string) => {
    return lockedDates.includes(d) || d < activeLogbookDate;
  };

  // Get date array for columns
  const activeDates = getDateArray(anchorDate, daysCount);

  // Track active popup editor: { id: string, date: string }
  const [editingCell, setEditingCell] = useState<{ employeeId: string; date: string } | null>(null);
  
  // Temporary states for cell being edited
  const [tempIn, setTempIn] = useState("");
  const [tempOut, setTempOut] = useState("");
  const [tempLoc, setTempLoc] = useState("");
  const [tempStatus, setTempStatus] = useState("DUTY");

  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState("");
  const [newEmployeeName, setNewEmployeeName] = useState("");

  // Location suggestions for Tour Operators in the Philippines
  const locationPresets = [
    "Caticlan Airport (MPH)",
    "Kalibo Airport (KLO)",
    "Caticlan Jetty Port",
    "Cagban Jetty Port",
    "Boracay Main Office",
    "Station 1 Beachfront",
    "Station 2 Beachfront",
    "Station 3 Beachfront",
    "Island Hopping Boat",
    "Puka Beach Coordinator",
    "Bulabog Beach Coordinator"
  ];

  // Helper to change anchor date by +/- 1 or 7 days
  const shiftAnchorDate = (days: number) => {
    try {
      const parts = anchorDate.split("-");
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      d.setDate(d.getDate() + days);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      setAnchorDate(`${year}-${month}-${day}`);
    } catch (e) {
      console.error(e);
    }
  };

  const startEditing = (empId: string, date: string, currentLog?: AttendanceDayLog) => {
    if (isDateLocked(date)) return;
    setEditingCell({ employeeId: empId, date });
    setTempIn(currentLog?.timeIn || "08:00 AM");
    setTempOut(currentLog?.timeOut || "05:00 PM");
    setTempLoc(currentLog?.location || "Main Office");
    
    let defaultStatus = currentLog?.status || "DUTY";
    if (!currentLog?.status && currentLog) {
      const locUpper = (currentLog.location || "").toUpperCase();
      const inUpper = (currentLog.timeIn || "").toUpperCase();
      if (locUpper.includes("DAY OFF") || inUpper === "OFF") {
        defaultStatus = "DAY OFF";
      } else if (locUpper.includes("HALF DAY")) {
        defaultStatus = "HALF DAY";
      }
    }
    setTempStatus(defaultStatus);
  };

  const saveCell = () => {
    if (!editingCell) return;
    
    // If all fields are empty and status is DUTY, delete the log
    if (!tempIn.trim() && !tempOut.trim() && !tempLoc.trim() && tempStatus === "DUTY") {
      onUpdateAttendance(editingCell.employeeId, editingCell.date, null);
    } else {
      onUpdateAttendance(editingCell.employeeId, editingCell.date, {
        timeIn: tempIn.trim() || "--",
        timeOut: tempOut.trim() || "--",
        location: tempLoc.trim() || "--",
        status: tempStatus
      });
    }
    setEditingCell(null);
  };

  const deleteCellLog = (empId: string, date: string) => {
    onUpdateAttendance(empId, date, null);
    setEditingCell(null);
  };

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const q = (searchQuery || searchEmployeeQuery).toLowerCase().trim();
    if (!q) return true;
    return emp.name.toLowerCase().includes(q);
  });

  return (
    <div id="attendance-records-container" className="space-y-6">
      {/* Table Header and Excel Utilities */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-150 border-2 border-black p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <h2 className="text-sm font-serif font-black italic text-black flex items-center gap-2 uppercase tracking-wide">
            <span className="w-2.5 h-2.5 bg-zinc-650 border border-black rounded-full animate-pulse" />
            SEC. C: CREW & PERSONNEL DUTY ROSTER (SPREADSHEET TRACKER)
          </h2>
          <p className="text-[10px] text-neutral-900 font-bold uppercase tracking-wider font-mono mt-0.5">
            Sinasala ang taya sa pag-log ng attendance, log/duty roster, at lokasyon ng bawat crew member.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportAttendanceToCSV(employees, activeDates)}
            className="bg-black text-white hover:bg-neutral-800 px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-colors cursor-pointer rounded-none"
          >
            <Download className="w-4 h-4 text-white" />
            EXPORT GRID TO EXCEL (.CSV)
          </button>
        </div>
      </div>

      {/* Date controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-mono font-black text-black uppercase">Simula ng Petsa:</label>
          <input
            type="date"
            value={anchorDate}
            onChange={(e) => setAnchorDate(e.target.value)}
            className="text-xs font-mono font-bold border-2 border-black rounded-none px-2.5 py-1.5 focus:outline-hidden focus:bg-amber-50 bg-white text-black"
          />
        </div>
        
        {/* Date Pager */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftAnchorDate(-7)}
            className="p-1 px-3 bg-white hover:bg-neutral-100 text-black text-[10px] font-mono font-black border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            title="Sulong ng 1 linggo pabalik"
          >
            « LAST WEEK
          </button>
          <button
            onClick={() => shiftAnchorDate(-1)}
            className="p-1.5 bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer rounded-none"
            title="Pabalik ng 1 araw"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-black" />
          </button>
          <span className="text-xs font-mono font-black text-black bg-[#FAFAFA] border-2 border-black px-3.5 py-1.5 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase select-none">
            {formatDateLabel(activeDates[0])} — {formatDateLabel(activeDates[activeDates.length - 1])}
          </span>
          <button
            onClick={() => shiftAnchorDate(1)}
            className="p-1.5 bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer rounded-none"
            title="Sulong ng 1 araw"
          >
            <ChevronRight className="w-3.5 h-3.5 text-black" />
          </button>
          <button
            onClick={() => shiftAnchorDate(7)}
            className="p-1 px-3 bg-white hover:bg-neutral-100 text-black text-[10px] font-mono font-black border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            title="Sulong ng 1 linggo"
          >
            NEXT WEEK »
          </button>
        </div>

        {/* Quick add and filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="I-filter ang Crew..."
              value={searchEmployeeQuery}
              onChange={(e) => setSearchEmployeeQuery(e.target.value)}
              className="text-xs font-mono font-semibold placeholder-neutral-400 border-2 border-black rounded-none px-2.5 py-1.5 w-40 focus:outline-hidden focus:bg-amber-50"
            />
          </div>
          
          <div className="flex border-2 border-black rounded-none overflow-hidden bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <input
              type="text"
              placeholder="BAGONG CREW NAME..."
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
              className="text-xs font-mono font-bold px-3 py-1.5 bg-white outline-none w-44 uppercase focus:bg-amber-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newEmployeeName.trim()) {
                  onAddEmployee(newEmployeeName.trim());
                  setNewEmployeeName("");
                }
              }}
            />
            <button
              onClick={() => {
                if (newEmployeeName.trim()) {
                  onAddEmployee(newEmployeeName.trim());
                  setNewEmployeeName("");
                }
              }}
              className="bg-black text-white hover:bg-neutral-800 px-3.5 py-1.5 text-xs font-mono font-black border-l-2 border-black uppercase cursor-pointer"
            >
              ADD
            </button>
          </div>

          <button
            onClick={() => {
              const nameInput = prompt("Ilagay ang pangalan ng bagong Personnel / Crew:");
              if (nameInput?.trim()) {
                onAddEmployee(nameInput.trim());
              }
            }}
            className="bg-white hover:bg-zinc-50 text-black border-2 border-black px-3.5 py-1.5 font-mono font-bold text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer rounded-none flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            INSERT BLANK CREW
          </button>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="bg-white border-2 border-black p-8 text-center text-gray-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <AlertCircle className="w-8 h-8 text-black mx-auto mb-2" />
          <p className="text-xs font-bold uppercase tracking-wider text-black">Walang nahanap na mga tauhan sa listahan.</p>
          <button
            onClick={() => {
              const nameInput = prompt("Ilagay ang pangalan ng bagong Personnel:");
              if (nameInput?.trim()) {
                onAddEmployee(nameInput.trim());
              }
            }}
            className="mt-4 bg-black text-white hover:bg-[#1A1A1A] border-2 border-black px-4 py-2 font-mono font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer rounded-none inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> IDAGDAG ANG UNANG CREW
          </button>
        </div>
      ) : (
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded-none relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                {/* Primary header row */}
                <tr className="bg-black text-white font-mono text-[9px] uppercase font-bold tracking-widest border-b-2 border-black select-none">
                  <th className="py-3 px-4 border-r border-black w-60 sticky left-0 bg-black z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                    NAME OF PERSONNEL
                  </th>
                  {activeDates.map((dateStr) => (
                    <th
                      key={dateStr}
                      className="py-3 px-3 border-r border-black text-center w-48 text-[10px] font-black uppercase tracking-wider text-white"
                    >
                      {formatDateHeader(dateStr)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-xs">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-amber-50/10 group odd:bg-white even:bg-neutral-50/50">
                    {/* Personnel Name Column (Sticky-left to give authentic spreadsheet navigation) */}
                    <td className="p-2 border-r-2 border-black font-semibold text-black sticky left-0 bg-white group-hover:bg-[#FAFAFA] shadow-[3px_0_6px_-2px_rgba(0,0,0,0.2)] z-10">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={emp.name}
                          onChange={(e) => onUpdateEmployeeName(emp.id, e.target.value)}
                          className="font-mono font-bold text-black border border-transparent rounded-none px-1.5 py-0.5 bg-transparent hover:bg-amber-50 focus:bg-white focus:border-black focus:outline-hidden w-full text-ellipsis uppercase"
                        />
                        <button
                          onClick={() => {
                            onDeleteEmployee(emp.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 border border-black hover:bg-rose-50 text-black hover:text-rose-750 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none rounded-none shrink-0 transition-all cursor-pointer"
                          title="Tanggalin si Employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Active date columns */}
                    {activeDates.map((dateStr) => {
                      const log = emp.logs[dateStr];
                      const isEditingThis = editingCell?.employeeId === emp.id && editingCell?.date === dateStr;

                      return (
                        <td
                          key={dateStr}
                          className="p-1.5 border-r border-black last:border-r-0 relative align-top"
                        >
                          {isEditingThis ? (
                            /* Cell Inline/Enclosed Spreadsheet Editor Interface */
                            <div className="bg-amber-50 border-2 border-black p-2 space-y-1.5 text-black w-full animate-fadeIn select-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                              <div className="flex justify-between items-center border-b border-black pb-1.5 mb-1">
                                <span className="font-mono font-black text-[8px] text-[#1A1A1A] tracking-wider uppercase">
                                  EDIT STATUS
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingCell(null)}
                                  className="text-black hover:text-[#555] font-black hover:bg-neutral-100 text-[10px] px-1 border border-transparent rounded-none"
                                >
                                  ×
                                </button>
                              </div>

                              {/* Day off / Half day segmented picker */}
                              <div className="grid grid-cols-3 gap-1 mb-1 mt-0.5">
                                {["DUTY", "HALF DAY", "DAY OFF"].map((statusOption) => (
                                  <button
                                    key={statusOption}
                                    type="button"
                                    onClick={() => {
                                      setTempStatus(statusOption);
                                      if (statusOption === "DAY OFF") {
                                        setTempIn("OFF");
                                        setTempOut("OFF");
                                        setTempLoc("DAY OFF");
                                      } else if (statusOption === "HALF DAY") {
                                        setTempIn("08:00 AM");
                                        setTempOut("12:00 PM");
                                        setTempLoc("HALF DAY");
                                      } else {
                                        setTempIn("08:00 AM");
                                        setTempOut("05:00 PM");
                                        setTempLoc("Main Office");
                                      }
                                    }}
                                    className={`py-0.5 font-mono font-black text-[7px] border tracking-tight text-center transition-all cursor-pointer select-none ${
                                      tempStatus === statusOption
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-black hover:bg-neutral-100 border-black"
                                    }`}
                                  >
                                    {statusOption}
                                  </button>
                                ))}
                              </div>
                              
                              <div className="space-y-1 text-[10px]">
                                <div className="flex items-center gap-1">
                                  <span className="font-mono font-black text-[7px] w-8 text-neutral-500 uppercase">IN:</span>
                                  <input
                                    type="text"
                                    value={tempIn}
                                    placeholder="08:00 AM"
                                    disabled={tempStatus === "DAY OFF"}
                                    onChange={(e) => setTempIn(e.target.value)}
                                    className="w-full text-[9px] font-mono font-bold border border-black rounded-none px-1 py-0.5 bg-white text-black outline-hidden uppercase disabled:bg-neutral-100 disabled:text-neutral-500"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveCell();
                                      else if (e.key === "Escape") setEditingCell(null);
                                    }}
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="font-mono font-black text-[7px] w-8 text-neutral-500 uppercase">OUT:</span>
                                  <input
                                    type="text"
                                    value={tempOut}
                                    placeholder="05:00 PM"
                                    disabled={tempStatus === "DAY OFF"}
                                    onChange={(e) => setTempOut(e.target.value)}
                                    className="w-full text-[9px] font-mono font-bold border border-black rounded-none px-1 py-0.5 bg-white text-black outline-hidden uppercase disabled:bg-neutral-100 disabled:text-neutral-500"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveCell();
                                      else if (e.key === "Escape") setEditingCell(null);
                                    }}
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex justify-between items-center">
                                    <span className="font-mono font-black text-[7px] text-neutral-500 uppercase">LOCATION:</span>
                                  </div>
                                  <input
                                    type="text"
                                    value={tempLoc}
                                    placeholder="e.g. JETTY PORT"
                                    disabled={tempStatus === "DAY OFF"}
                                    onChange={(e) => setTempLoc(e.target.value)}
                                    className="w-full text-[9px] font-mono font-bold border border-black rounded-none px-1 py-0.5 bg-white text-black outline-hidden uppercase disabled:bg-neutral-100 disabled:text-neutral-500"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveCell();
                                      else if (e.key === "Escape") setEditingCell(null);
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Form Controls */}
                              <div className="flex justify-between items-center gap-1 mt-1.5 pt-1.5 border-t border-dashed border-black">
                                <button
                                  type="button"
                                  onClick={() => deleteCellLog(emp.id, dateStr)}
                                  className="text-red-750 hover:underline font-mono font-black text-[8px] uppercase cursor-pointer"
                                >
                                  DELET
                                </button>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingCell(null)}
                                    className="text-black font-mono font-bold border border-black bg-white px-1.5 py-0.5 text-[8px] uppercase font-bold cursor-pointer rounded-none"
                                  >
                                    CANC
                                  </button>
                                  <button
                                    type="button"
                                    onClick={saveCell}
                                    className="bg-black text-white hover:bg-[#1A1A1A] border border-black px-2 py-0.5 text-[8px] font-mono font-black uppercase flex items-center gap-0.5 rounded-none cursor-pointer"
                                  >
                                    SAVE
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : log ? (
                            /* Active Log Status Card */
                            (() => {
                              const isDayOff = log.status === "DAY OFF" || log.location?.toUpperCase() === "DAY OFF" || log.timeIn?.toUpperCase() === "OFF";
                              const isHalfDay = log.status === "HALF DAY" || log.location?.toUpperCase() === "HALF DAY" || log.location?.toUpperCase().includes("HALF");
                              
                              let bgClass = "bg-[#FAFAFA]";
                              let borderClass = "border-black";
                              let textClass = "text-black";
                              let badgeBg = "bg-white";
                              
                              if (isDayOff) {
                                bgClass = "bg-rose-50";
                                borderClass = "border-rose-400";
                                textClass = "text-rose-850";
                                badgeBg = "bg-rose-100 text-rose-800";
                              } else if (isHalfDay) {
                                bgClass = "bg-amber-50/70";
                                borderClass = "border-amber-400";
                                textClass = "text-amber-850";
                                badgeBg = "bg-amber-100 text-amber-800";
                              }

                              const locked = isDateLocked(dateStr);
                              const cellHoverClass = locked 
                                ? "cursor-not-allowed opacity-80" 
                                : "hover:bg-[#F2EDD5] hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] cursor-pointer";

                              return (
                                <div
                                  onClick={() => startEditing(emp.id, dateStr, log)}
                                  className={`p-1 px-1.5 border ${borderClass} rounded-none ${bgClass} ${cellHoverClass} text-[10px] space-y-1 transition-all select-none`}
                                  title={locked ? "NAKA-LOCK (PERMANENT)" : "I-click para baguhin ang duty log"}
                                >
                                  {isDayOff ? (
                                    <div className="text-center py-1.5 font-mono font-black tracking-wider text-[10px] uppercase text-rose-800">
                                      🚫 DAY OFF
                                    </div>
                                  ) : (
                                    <>
                                      <div className={`flex items-center gap-0.5 font-mono font-black ${textClass}`}>
                                        <Clock className="w-2.5 h-2.5 text-current shrink-0" />
                                        <span className="text-[9px]">{log.timeIn}</span>
                                        <span className="font-normal text-[9px]">-</span>
                                        <span className="text-[9px]">{log.timeOut}</span>
                                      </div>
                                      <div className={`flex items-center gap-0.5 font-mono font-bold text-black border border-black ${badgeBg} px-1 py-0.5 rounded-none text-[8px] uppercase truncate max-w-full`}>
                                        <MapPin className="w-2 h-2 shrink-0" />
                                        <span className="truncate">{log.location}</span>
                                      </div>
                                      {isHalfDay && (
                                        <div className="text-center font-mono font-black tracking-tight text-[8px] uppercase bg-[#FFC000] text-black py-0.5 mt-1 border border-black leading-none">
                                          HALF DAY
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            /* Blank Slot / Add Duty button */
                            (() => {
                              const locked = isDateLocked(dateStr);
                              return locked ? (
                                <div
                                  className="h-10 border border-solid border-neutral-100 bg-neutral-50/20 flex items-center justify-center cursor-not-allowed rounded-none select-none"
                                  title="NAKA-LOCK"
                                >
                                  <span className="text-[7.5px] font-mono font-bold text-gray-450 uppercase tracking-widest flex items-center gap-0.5">
                                    🔒 LOCKED
                                  </span>
                                </div>
                              ) : (
                                <div
                                  onClick={() => startEditing(emp.id, dateStr)}
                                  className="h-10 border border-dashed border-neutral-300 hover:border-black hover:bg-amber-50/10 flex items-center justify-center cursor-pointer rounded-none group/add transition-colors"
                                  title="I-click para mag-log ng attendance"
                                >
                                  <span className="text-[8px] font-mono font-bold text-gray-400 group-hover/add:text-black uppercase tracking-wider flex items-center gap-0.5 select-none">
                                    <Plus className="w-2.5 h-2.5 text-gray-400 group-hover/add:text-black" /> LOG DUTY
                                  </span>
                                </div>
                              );
                            })()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
