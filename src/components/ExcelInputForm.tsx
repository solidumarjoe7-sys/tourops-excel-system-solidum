import React, { useState, useEffect } from "react";
import { PlusCircle, Plane, CheckCircle2, FileInput, UserPlus, Clock, ClipboardList } from "lucide-react";
import { ArrivalRecord, DepartureRecord, EmployeeAttendance, AttendanceDayLog, Language } from "../types";
import { translations } from "../translations";

interface ExcelInputFormProps {
  onSaveArrival: (record: Omit<ArrivalRecord, "id">) => void;
  onSaveDeparture: (record: Omit<DepartureRecord, "id">) => void;
  onAddEmployee: (name: string) => void;
  onUpdateAttendance?: (employeeId: string, dateStr: string, log: AttendanceDayLog | null) => void;
  employees?: EmployeeAttendance[];
  activeTab: "arrival" | "departure" | "attendance";
  setActiveTab?: (tab: "arrival" | "departure" | "attendance") => void;
  language: Language;
  activeLogbookDate: string;
  lockedDates: string[];
}

export default function ExcelInputForm({
  onSaveArrival,
  onSaveDeparture,
  onAddEmployee,
  onUpdateAttendance,
  employees = [],
  activeTab,
  setActiveTab,
  language,
  activeLogbookDate,
  lockedDates
}: ExcelInputFormProps) {
  const t = translations[language];

  // Mode selection: "arrival", "departure", "personnel"
  const [formType, setFormType] = useState<"arrival" | "departure" | "personnel">(
    activeTab === "departure" ? "departure" : activeTab === "attendance" ? "personnel" : "arrival"
  );

  // Sync state if activeTab gets updated from parent
  useEffect(() => {
    setFormType(activeTab === "departure" ? "departure" : activeTab === "attendance" ? "personnel" : "arrival");
  }, [activeTab]);

  const handleFormTypeChange = (type: "arrival" | "departure" | "personnel") => {
    setFormType(type);
    if (setActiveTab) {
      setActiveTab(type === "departure" ? "departure" : type === "personnel" ? "attendance" : "arrival");
    }
  };

  // --- ARRIVALS SEPARATE STATE ---
  const [arrDate, setArrDate] = useState(activeLogbookDate);
  const [arrName, setArrName] = useState("");
  const [arrPax, setArrPax] = useState<number>(2);
  const [arrAvail, setArrAvail] = useState("RT Transfer");
  const [arrNumber, setArrNumber] = useState("");
  const [arrHotel, setArrHotel] = useState("");
  const [arrEta, setArrEta] = useState("10:00 AM");
  const [arrCollect, setArrCollect] = useState("PHP 1,800");
  const [arrEpay, setArrEpay] = useState("");
  const [arrActivities, setArrActivities] = useState("");
  const [arrLocal, setArrLocal] = useState("");
  const [arrForeign, setArrForeign] = useState("");
  const [arrDiscounted, setArrDiscounted] = useState("");

  // --- DEPARTURES SEPARATE STATE ---
  const [depDate, setDepDate] = useState(activeLogbookDate);
  const [depName, setDepName] = useState("");
  const [depPax, setDepPax] = useState<number>(2);
  const [depAvail, setDepAvail] = useState("RT Outbound Transfer");
  const [depNumber, setDepNumber] = useState("");
  const [depHotel, setDepHotel] = useState("");
  const [depEtd, setDepEtd] = useState("01:00 PM");
  const [depPickupTime, setDepPickupTime] = useState("10:00 AM");
  const [depPage, setDepPage] = useState("");
  const [depLeadGuest, setDepLeadGuest] = useState("");
  const [depUnit, setDepUnit] = useState("");
  const [depOthers, setDepOthers] = useState("");

  // --- PERSONNEL SEPARATE STATE ---
  const [employeeName, setEmployeeName] = useState("");
  const [personnelMode, setPersonnelMode] = useState<"register" | "duty">("register");

  // --- DIRECT CREW DUTY LOG ENCODER STATE ---
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [dutyDate, setDutyDate] = useState(activeLogbookDate);
  const [dutyIn, setDutyIn] = useState("08:00 AM");
  const [dutyOut, setDutyOut] = useState("05:00 PM");
  const [dutyLocation, setDutyLocation] = useState("Jetty Port");

  // Sync dates to activeLogbookDate when it shifts
  useEffect(() => {
    if (activeLogbookDate) {
      setArrDate(activeLogbookDate);
      setDepDate(activeLogbookDate);
      setDutyDate(activeLogbookDate);
    }
  }, [activeLogbookDate]);

  // Auto select first personnel if changing mode
  useEffect(() => {
    if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].id);
    }
  }, [employees, selectedEmpId]);

  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const loadArrivalPreset = (presetName: string) => {
    if (presetName === "transfer") {
      setArrAvail("RT Transfer (Airport ⇄ Hotel)");
      setArrCollect("PHP 3,600 (Collect)");
    } else if (presetName === "tour") {
      setArrAvail("Island Hopping Tour A");
      setArrCollect("PHP 5,000 (Paid)");
    } else if (presetName === "vip") {
      setArrAvail("Private Yacht Charter");
      setArrCollect("PHP 12,500 (Paid)");
    }
  };

  const loadDeparturePreset = (presetName: string) => {
    if (presetName === "transfer") {
      setDepAvail("RT Outbound Transfer");
      setDepPickupTime("10:00 AM");
    } else if (presetName === "early") {
      setDepAvail("Early Flight Outbound Run");
      setDepPickupTime("04:30 AM");
    } else if (presetName === "vip") {
      setDepAvail("Private Boat Chartered Outbound");
      setDepPickupTime("01:00 PM");
    }
  };

  const loadDutyLocationPreset = (presetName: string) => {
    setDutyLocation(presetName);
  };

  const isFormDateLocked = (testDate: string) => {
    return lockedDates.includes(testDate) || testDate < activeLogbookDate;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formType === "personnel") {
      if (personnelMode === "register") {
        if (!employeeName.trim()) {
          alert(language === "tl" ? "Mangyaring ilagay ang pangalan ng crew." : "Please enter human name of the crew.");
          return;
        }
        onAddEmployee(employeeName.trim());
        triggerNotification(language === "tl" ? `🟢 Naidagdag si "${employeeName}" sa registry ng crew!` : `🟢 Added si "${employeeName}" to crew registry!`);
        setEmployeeName("");
      } else {
        // Attendance Duty Log Submission
        if (!selectedEmpId) {
          alert(language === "tl" ? "Mangyaring pumili muna ng crew member sa dropdown list." : "Please select a crew member first.");
          return;
        }
        if (isFormDateLocked(dutyDate)) {
          alert(t.lockWarningNotification);
          return;
        }
        if (onUpdateAttendance) {
          onUpdateAttendance(selectedEmpId, dutyDate, {
            timeIn: dutyIn.trim(),
            timeOut: dutyOut.trim(),
            location: dutyLocation.trim()
          });
          const emp = employees.find((x) => x.id === selectedEmpId);
          triggerNotification(language === "tl" ? `📅 Na-log ang duty ni ${emp ? emp.name : "Crew"} sa date ${dutyDate}!` : `📅 Logged duty for ${emp ? emp.name : "Crew"} on date ${dutyDate}!`);
        }
      }
      return;
    }

    if (formType === "arrival") {
      if (!arrName.trim()) {
        alert(language === "tl" ? "Mangyaring ilagay ang pangalan ng guest." : "Please enter guest name.");
        return;
      }
      if (isFormDateLocked(arrDate)) {
        alert(t.lockWarningNotification);
        return;
      }
      onSaveArrival({
        date: arrDate,
        name: arrName.trim(),
        pax: Number(arrPax) || 1,
        avail: arrAvail.trim(),
        number: arrNumber.trim(),
        hotel: arrHotel.trim(),
        eta: arrEta.trim(),
        collect: arrCollect.trim(),
        epay: arrEpay.trim(),
        activities: arrActivities.trim(),
        local: arrLocal.trim(),
        foreign: arrForeign.trim(),
        discounted: arrDiscounted.trim()
      });
      triggerNotification(language === "tl" ? `🟢 Na-save ang Arrival record para kay ${arrName}!` : `🟢 Saved Arrival record for ${arrName}!`);
      
      // Reset variables specifically for Arrivals
      setArrName("");
      setArrNumber("");
      setArrPax(2);
      setArrEpay("");
      setArrActivities("");
      setArrLocal("");
      setArrForeign("");
      setArrDiscounted("");
    } else {
      // Departures Submission
      if (!depName.trim()) {
        alert(language === "tl" ? "Mangyaring ilagay ang pangalan ng guest." : "Please enter guest name.");
        return;
      }
      if (isFormDateLocked(depDate)) {
        alert(t.lockWarningNotification);
        return;
      }
      onSaveDeparture({
        date: depDate,
        name: depName.trim(),
        pax: Number(depPax) || 1,
        avail: depAvail.trim(),
        number: depNumber.trim(),
        hotel: depHotel.trim(),
        etd: depEtd.trim(),
        pickupTime: depPickupTime.trim(),
        page: depPage.trim(),
        leadGuest: depLeadGuest.trim(),
        unit: depUnit.trim(),
        others: depOthers.trim()
      });
      triggerNotification(language === "tl" ? `🔵 Na-save ang Departure record para kay ${depName}!` : `🔵 Saved Departure record for ${depName}!`);

      // Reset variables specifically for Departures
      setDepName("");
      setDepNumber("");
      setDepPax(2);
      setDepPage("");
      setDepLeadGuest("");
      setDepUnit("");
      setDepOthers("");
    }
  };

  return (
    <div id="excel-input-form-card" className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden mb-6">
      {/* Header Panel */}
      <div className="bg-[#FAFAFA] px-5 py-3.5 border-b-2 border-black flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileInput className="w-4.5 h-4.5 text-black" />
          <h3 className="font-serif font-black italic text-[#1A1A1A] text-sm uppercase tracking-tight">
            {t.quickEncoderTitle}
          </h3>
        </div>
        
        {/* Encoding Toggles (Coordinated dynamically with tables নিচে) */}
        <div className="flex bg-white p-0.5 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <button
            type="button"
            id="form-toggle-arrival"
            onClick={() => handleFormTypeChange("arrival")}
            className={`px-3.5 py-1.5 text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer rounded-none border-r-2 border-black flex items-center gap-2 ${
              formType === "arrival"
                ? "bg-emerald-100 text-emerald-955 font-black"
                : "text-gray-400 hover:text-black hover:bg-gray-50"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${formType === "arrival" ? "bg-emerald-600 animate-pulse" : "bg-emerald-300"}`} />
            {t.tabArrivals}
          </button>
          <button
            type="button"
            id="form-toggle-departure"
            onClick={() => handleFormTypeChange("departure")}
            className={`px-3.5 py-1.5 text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer rounded-none border-r-2 border-black flex items-center gap-2 ${
              formType === "departure"
                ? "bg-blue-100 text-blue-950 font-black"
                : "text-gray-400 hover:text-black hover:bg-gray-50"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${formType === "departure" ? "bg-blue-600 animate-pulse" : "bg-blue-300"}`} />
            {t.tabDepartures}
          </button>
          <button
            type="button"
            id="form-toggle-personnel"
            onClick={() => handleFormTypeChange("personnel")}
            className={`px-3.5 py-1.5 text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer rounded-none flex items-center gap-2 ${
              formType === "personnel"
                ? "bg-slate-200 text-slate-955 font-black"
                : "text-gray-400 hover:text-black hover:bg-gray-50"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${formType === "personnel" ? "bg-black animate-pulse" : "bg-gray-300"}`} />
            {t.tabPersonnel}
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-100 border-b-2 border-black px-5 py-2.5 text-[11px] font-mono font-bold text-emerald-950 flex items-center gap-2 animate-fadeIn uppercase">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Form Fields */}
      <form onSubmit={handleSubmit} className="p-5">
        
        {/* ==================== 1. ARRIVAL TAILORED FORM ==================== */}
        {formType === "arrival" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono flex items-center justify-between gap-1">
                  <span>{t.formArrivalDate}</span>
                  {isFormDateLocked(arrDate) && <span className="text-rose-600 font-bold">🔒 LOCKED</span>}
                </label>
                <input
                  type="date"
                  required
                  value={arrDate}
                  onChange={(e) => setArrDate(e.target.value)}
                  className={`w-full text-xs font-mono font-bold border-2 rounded-none px-3 py-2 uppercase outline-none ${
                    isFormDateLocked(arrDate) 
                      ? "border-rose-500 bg-rose-50 text-rose-900 focus:bg-rose-50" 
                      : "border-black bg-white text-black focus:bg-amber-50"
                  }`}
                />
                {isFormDateLocked(arrDate) && (
                  <p className="text-[9px] text-rose-600 font-mono mt-1 font-bold">
                    {t.warningPastLocked}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                  {t.formGuestName}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Reyes Party o John Smith"
                  value={arrName}
                  onChange={(e) => setArrName(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                  {t.formPaxCount}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={arrPax}
                  onChange={(e) => setArrPax(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                  {t.formContactNumber}
                </label>
                <input
                  type="text"
                  placeholder="e.g., 0917-123-4567"
                  value={arrNumber}
                  onChange={(e) => setArrNumber(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                  {t.formDestinationHotel}
                </label>
                <input
                  type="text"
                  placeholder="e.g., Henann Resort"
                  value={arrHotel}
                  onChange={(e) => setArrHotel(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">
                    {t.formServiceAvail}
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => loadArrivalPreset("transfer")}
                      className="text-[8px] bg-white border border-black px-1.5 py-0.2 rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-mono font-bold hover:bg-gray-100 cursor-pointer uppercase text-black"
                    >
                      Trans
                    </button>
                    <button
                      type="button"
                      onClick={() => loadArrivalPreset("tour")}
                      className="text-[8px] bg-white border border-black px-1.5 py-0.2 rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-mono font-bold hover:bg-gray-100 cursor-pointer uppercase text-black"
                    >
                      Tour
                    </button>
                    <button
                      type="button"
                      onClick={() => loadArrivalPreset("vip")}
                      className="text-[8px] bg-white border border-black px-1.5 py-0.2 rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-mono font-bold hover:bg-gray-100 cursor-pointer uppercase text-black"
                    >
                      Yacht
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g., RT Airport Transfer"
                  value={arrAvail}
                  onChange={(e) => setArrAvail(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                  {t.formETA}
                </label>
                <input
                  type="text"
                  placeholder="e.g., 09:45 AM"
                  value={arrEta}
                  onChange={(e) => setArrEta(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                  {t.formCollect}
                </label>
                <input
                  type="text"
                  placeholder="e.g., PHP 3,500 o Paid"
                  value={arrCollect}
                  onChange={(e) => setArrCollect(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#B45309] uppercase tracking-widest mb-1.5 font-mono">
                  E-Pay
                </label>
                <input
                  type="text"
                  placeholder="e.g., GCash 1,500 o Bank"
                  value={arrEpay}
                  onChange={(e) => setArrEpay(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#047857] uppercase tracking-widest mb-1.5 font-mono">
                  Activities
                </label>
                <input
                  type="text"
                  placeholder="e.g., Kayak o Zipline"
                  value={arrActivities}
                  onChange={(e) => setArrActivities(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#1D4ED8] uppercase tracking-widest mb-1.5 font-mono">
                  {language === "tl" ? "Tawong Lokal" : "Local Guests"}
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2 o None"
                  value={arrLocal}
                  onChange={(e) => setArrLocal(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6B21A8] uppercase tracking-widest mb-1.5 font-mono">
                  {language === "tl" ? "Dayuhan" : "Foreign Guests"}
                </label>
                <input
                  type="text"
                  placeholder="e.g., 3 o None"
                  value={arrForeign}
                  onChange={(e) => setArrForeign(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#BE185D] uppercase tracking-widest mb-1.5 font-mono">
                  {language === "tl" ? "May Discount (SC/PWD)" : "Discounted Guests"}
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1 Senior / Kid"
                  value={arrDiscounted}
                  onChange={(e) => setArrDiscounted(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Live Row Preview */}
            <div className="bg-[#FAFDFB] p-4 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[10px] font-mono font-black text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-emerald-800" />
                {t.previewArrivalSpreadsheet}
              </div>
              <div className="overflow-x-auto whitespace-nowrap">
                <table className="w-full font-mono text-[11px] text-black border-collapse">
                  <thead>
                    <tr className="bg-emerald-800 text-white uppercase text-[9px] tracking-wider text-left">
                      <th className="p-1.5 border border-black font-black">{t.colDate}</th>
                      <th className="p-1.5 border border-black font-black">{t.colGuest}</th>
                      <th className="p-1.5 border border-black font-black text-center">{t.colPax}</th>
                      <th className="p-1.5 border border-black font-black">{t.colService}</th>
                      <th className="p-1.5 border border-black font-black">{t.colPhone}</th>
                      <th className="p-1.5 border border-black font-black">{t.colHotel}</th>
                      <th className="p-1.5 border border-black font-black">{t.colETA}</th>
                      <th className="p-1.5 border border-black font-black">{t.colCollect}</th>
                      <th className="p-1.5 border border-black font-black">E-PAY</th>
                      <th className="p-1.5 border border-black font-black">ACTIVITIES</th>
                      <th className="p-1.5 border border-black font-black">LOCAL</th>
                      <th className="p-1.5 border border-black font-black">FOREIGN</th>
                      <th className="p-1.5 border border-black font-black">DISCOUNTED</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="p-1.5 border border-neutral-300 font-bold">{arrDate || "YYYY-MM-DD"}</td>
                      <td className="p-1.5 border border-neutral-300 font-black uppercase text-emerald-950">{arrName || t.placeholderTypeName}</td>
                      <td className="p-1.5 border border-neutral-300 text-center font-black">{arrPax} PAX</td>
                      <td className="p-1.5 border border-neutral-300 font-bold uppercase">{arrAvail || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-semibold">{arrNumber || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-bold uppercase">{arrHotel || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-black uppercase">{arrEta || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-black text-rose-750 uppercase">{arrCollect || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-black text-amber-800 uppercase">{arrEpay || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-bold text-emerald-800 uppercase">{arrActivities || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-bold text-blue-800 text-center">{arrLocal || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-bold text-purple-800 text-center">{arrForeign || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-bold text-pink-850 text-center">{arrDiscounted || "---"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#1A1A1A]">
                💡 {t.tipArrivalSave}
              </div>
              <button
                type="submit"
                id="submit-arrival-record"
                className="px-6 py-2.5 border-2 border-black bg-black text-white hover:bg-neutral-800 rounded-none text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer"
              >
                {t.btnSaveArrival}
              </button>
            </div>
          </div>
        )}

        {/* ==================== 2. DEPARTURE OUTBOUNDS TAILORED FORM ==================== */}
        {formType === "departure" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono flex items-center justify-between gap-1">
                  <span>{t.formDepartureDate}</span>
                  {isFormDateLocked(depDate) && <span className="text-rose-600 font-bold">🔒 LOCKED</span>}
                </label>
                <input
                  type="date"
                  required
                  value={depDate}
                  onChange={(e) => setDepDate(e.target.value)}
                  className={`w-full text-xs font-mono font-bold border-2 rounded-none px-3 py-2 uppercase outline-none ${
                    isFormDateLocked(depDate) 
                      ? "border-rose-500 bg-rose-50 text-rose-900 focus:bg-rose-50" 
                      : "border-black bg-white text-black focus:bg-amber-50"
                  }`}
                />
                {isFormDateLocked(depDate) && (
                  <p className="text-[9px] text-rose-600 font-mono mt-1 font-bold">
                    {t.warningPastLocked}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                  {t.formGuestName}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Jones Group o Alice Cooper"
                  value={depName}
                  onChange={(e) => setDepName(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                  {t.formPaxCount}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={depPax}
                  onChange={(e) => setDepPax(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                  {t.formContactNumber}
                </label>
                <input
                  type="text"
                  placeholder="e.g., 0918-999-8888"
                  value={depNumber}
                  onChange={(e) => setDepNumber(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                  {t.formHotelRecovery}
                </label>
                <input
                  type="text"
                  placeholder="e.g., Station 2 Sands Hotel"
                  value={depHotel}
                  onChange={(e) => setDepHotel(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">
                    {t.formOutboundService}
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => loadDeparturePreset("transfer")}
                      className="text-[8px] bg-white border border-black px-1.5 py-0.2 rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-mono font-bold hover:bg-gray-100 cursor-pointer uppercase text-black"
                    >
                      Outbound
                    </button>
                    <button
                      type="button"
                      onClick={() => loadDeparturePreset("early")}
                      className="text-[8px] bg-white border border-black px-1.5 py-0.2 rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-mono font-bold hover:bg-gray-100 cursor-pointer uppercase text-black"
                    >
                      Early Flight
                    </button>
                    <button
                      type="button"
                      onClick={() => loadDeparturePreset("vip")}
                      className="text-[8px] bg-white border border-black px-1.5 py-0.2 rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-mono font-bold hover:bg-gray-100 cursor-pointer uppercase text-black"
                    >
                      Boat
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g., RT Outbound Transfer"
                  value={depAvail}
                  onChange={(e) => setDepAvail(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                  {t.formETD}
                </label>
                <input
                  type="text"
                  placeholder="e.g., 03:30 PM"
                  value={depEtd}
                  onChange={(e) => setDepEtd(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                  {t.formPickupTime}
                </label>
                <input
                  type="text"
                  placeholder="e.g., 11:30 AM"
                  value={depPickupTime}
                  onChange={(e) => setDepPickupTime(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#047857] uppercase tracking-widest mb-1.5 font-mono">
                  PAGE
                </label>
                <input
                  type="text"
                  placeholder="e.g., Page 15"
                  value={depPage}
                  onChange={(e) => setDepPage(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#B45309] uppercase tracking-widest mb-1.5 font-mono">
                  LEAD GUEST
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mr. Henderson"
                  value={depLeadGuest}
                  onChange={(e) => setDepLeadGuest(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#1D4ED8] uppercase tracking-widest mb-1.5 font-mono">
                  UNIT
                </label>
                <input
                  type="text"
                  placeholder="e.g., Van B / Coaster"
                  value={depUnit}
                  onChange={(e) => setDepUnit(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6B21A8] uppercase tracking-widest mb-1.5 font-mono">
                  OTHERS
                </label>
                <input
                  type="text"
                  placeholder="e.g., Requiring Porter"
                  value={depOthers}
                  onChange={(e) => setDepOthers(e.target.value)}
                  className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Live Row Preview */}
            <div className="bg-[#FAFDFD] p-4 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[10px] font-mono font-black text-blue-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-blue-800 rotate-180" />
                {t.previewDepartureSpreadsheet}
              </div>
              <div className="overflow-x-auto whitespace-nowrap">
                <table className="w-full font-mono text-[11px] text-black border-collapse">
                  <thead>
                    <tr className="bg-blue-850 text-white uppercase text-[9px] tracking-wider text-left">
                      <th className="p-1.5 border border-black font-black">{t.colDate}</th>
                      <th className="p-1.5 border border-black font-black">{t.colGuest}</th>
                      <th className="p-1.5 border border-black font-black text-center">{t.colPax}</th>
                      <th className="p-1.5 border border-black font-black">{t.formOutboundService}</th>
                      <th className="p-1.5 border border-black font-black">{t.colPhone}</th>
                      <th className="p-1.5 border border-black font-black">{t.colRecovery}</th>
                      <th className="p-1.5 border border-black font-black">{t.colETD}</th>
                      <th className="p-1.5 border border-black font-black">{t.colPickup}</th>
                      <th className="p-1.5 border border-black font-black">PAGE</th>
                      <th className="p-1.5 border border-black font-black">LEAD GUEST</th>
                      <th className="p-1.5 border border-black font-black">UNIT</th>
                      <th className="p-1.5 border border-black font-black">OTHERS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="p-1.5 border border-neutral-300 font-bold">{depDate || "YYYY-MM-DD"}</td>
                      <td className="p-1.5 border border-neutral-300 font-black uppercase text-blue-950">{depName || t.placeholderTypeName}</td>
                      <td className="p-1.5 border border-neutral-300 text-center font-black">{depPax} PAX</td>
                      <td className="p-1.5 border border-neutral-300 font-bold uppercase">{depAvail || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-semibold">{depNumber || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-bold uppercase">{depHotel || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-black uppercase">{depEtd || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-black text-rose-750 uppercase">{depPickupTime || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-black text-emerald-800 uppercase">{depPage || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-bold text-amber-850 uppercase">{depLeadGuest || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-bold text-blue-800 text-center">{depUnit || "---"}</td>
                      <td className="p-1.5 border border-neutral-300 font-bold text-purple-800 text-center">{depOthers || "---"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#1A1A1A]">
                💡 {t.tipDepartureSave}
              </div>
              <button
                type="submit"
                id="submit-departure-record"
                className="px-6 py-2.5 border-2 border-black bg-black text-white hover:bg-neutral-800 rounded-none text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer"
              >
                {t.btnSaveDeparture}
              </button>
            </div>
          </div>
        )}

        {/* ==================== 3. CREW & PERSONNEL TAILORED FORM ==================== */}
        {formType === "personnel" && (
          <div className="space-y-5">
            
            {/* Personnel sub-toggles */}
            <div className="flex border-b-2 border-black pb-3 gap-4">
              <button
                type="button"
                onClick={() => setPersonnelMode("register")}
                className={`px-4 py-2 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer ${
                  personnelMode === "register" ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-50"
                }`}
              >
                <UserPlus className="w-4.5 h-4.5" />
                {t.tabRegisterCrew}
              </button>
              <button
                type="button"
                onClick={() => setPersonnelMode("duty")}
                className={`px-4 py-2 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer ${
                  personnelMode === "duty" ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-50"
                }`}
              >
                <Clock className="w-4.5 h-4.5" />
                {t.tabCrewRoster}
              </button>
            </div>

            {personnelMode === "register" ? (
              /* A. Registering New Employee Form */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                      {t.formNewPersonnel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Kuya Dan (Driver) o Ate Tess (Coordinator)"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      id="submit-register-crew"
                      className="w-full md:w-auto bg-black text-white px-5 py-2.5 text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 rounded-none cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-white" />
                      {t.btnRegisterCrew}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">
                  {t.tipPersonnelSave}
                </p>
              </div>
            ) : (
              /* B. Registering/Logging Duty Form */
              <div className="space-y-4">
                {employees.length === 0 ? (
                  <div className="bg-amber-50 border-2 border-dashed border-black p-4 text-center">
                    <p className="text-xs font-mono font-bold text-black uppercase">
                      {t.alertNoCrew}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Select Crew dropdown */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                        {t.formSelectCrew}
                      </label>
                      <select
                        value={selectedEmpId}
                        onChange={(e) => setSelectedEmpId(e.target.value)}
                        className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50"
                      >
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono flex items-center justify-between gap-1">
                        <span>{t.formDutyDate}</span>
                        {isFormDateLocked(dutyDate) && <span className="text-rose-600 font-bold">🔒 LOCKED</span>}
                      </label>
                      <input
                        type="date"
                        required
                        value={dutyDate}
                        onChange={(e) => setDutyDate(e.target.value)}
                        className={`w-full text-xs font-mono font-bold border-2 rounded-none px-3 py-2 uppercase outline-none ${
                          isFormDateLocked(dutyDate) 
                            ? "border-rose-500 bg-rose-50 text-rose-900 focus:bg-rose-50" 
                            : "border-black bg-white text-black focus:bg-amber-50"
                        }`}
                      />
                      {isFormDateLocked(dutyDate) && (
                        <p className="text-[9px] text-rose-600 font-mono mt-1 font-bold">
                          {t.warningPastLocked}
                        </p>
                      )}
                    </div>

                    {/* Time In */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                        Time In
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 08:00 AM"
                        value={dutyIn}
                        onChange={(e) => setDutyIn(e.target.value)}
                        className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50"
                      />
                    </div>

                    {/* Time Out */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                        Time Out
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 05:00 PM"
                        value={dutyOut}
                        onChange={(e) => setDutyOut(e.target.value)}
                        className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">
                          {t.formDestination}
                        </label>
                        <span className="text-[8px] font-black text-gray-400">PRESETS ▼</span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Station 1 Beach"
                        value={dutyLocation}
                        onChange={(e) => setDutyLocation(e.target.value)}
                        className="w-full text-xs font-mono font-bold border-2 border-black rounded-none px-3 py-2 bg-white uppercase outline-none focus:bg-amber-50 placeholder-gray-400"
                      />
                      {/* Location quick preset chips */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {["Airport", "Jetty Port", "Hotel Lobby", "Port/Boat", "Island Tour"].map((p) => (
                          <button
                            type="button"
                            key={p}
                            onClick={() => loadDutyLocationPreset(p)}
                            className="text-[8px] bg-white border border-black px-1.5 py-0.5 rounded-none font-mono font-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50 active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit duty log button */}
                {employees.length > 0 && (
                  <div className="flex justify-end pt-3 text-right">
                    <button
                      type="submit"
                      id="submit-crew-duty"
                      className="bg-black text-white hover:bg-neutral-800 border-2 border-black px-5 py-2.5 text-xs font-mono font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer rounded-none flex items-center gap-2"
                    >
                      <ClipboardList className="w-4 h-4 text-white" />
                      {t.btnLogDuty}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </form>
    </div>
  );
}
