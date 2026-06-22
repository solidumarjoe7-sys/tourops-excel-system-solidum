import { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  Search, 
  HelpCircle, 
  ArrowUpDown, 
  CheckSquare, 
  Info,
  Layers,
  Sparkles,
  CalendarDays
} from "lucide-react";
import { ArrivalRecord, DepartureRecord, EmployeeAttendance, AttendanceDayLog, Language } from "./types";
import { translations } from "./translations";
// Demo datasets are no longer active as requested
import DashboardStats from "./components/DashboardStats";
import ExcelInputForm from "./components/ExcelInputForm";
import ArrivalTable from "./components/ArrivalTable";
import DepartureTable from "./components/DepartureTable";
import AttendanceTable from "./components/AttendanceTable";

export default function App() {
  // 1. Core States (Arrivals, Departures, Employee Attendance)
  const [arrivals, setArrivals] = useState<ArrivalRecord[]>([]);
  const [departures, setDepartures] = useState<DepartureRecord[]>([]);
  const [attendance, setAttendance] = useState<EmployeeAttendance[]>([]);

  // 2. Active view Tab state
  const [activeTab, setActiveTab] = useState<"arrival" | "departure" | "attendance">("arrival");

  // Daily Logbook States
  const [activeLogbookDate, setActiveLogbookDate] = useState<string>(() => {
    return localStorage.getItem("tourops_active_logbook_date") || "2026-06-13";
  });
  const [lockedDates, setLockedDates] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem("tourops_locked_dates");
      return cached ? JSON.parse(cached) : [];
    } catch (_) {
      return [];
    }
  });

  // 3. Search and Date Filters
  const [searchQuery, setSearchQuery] = useState("");

  // 4. Instructions/Help overlay visibility
  const [showHelp, setShowHelp] = useState(true);

  // 4b. Language Translation State
  const [language, setLanguage] = useState<Language>(() => {
    const cached = localStorage.getItem("tourops_language");
    return (cached === "en" || cached === "tl") ? cached : "tl";
  });

  const t = translations[language];

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("tourops_language", lang);
  };

  // Load from local storage or fallback to curated demo dataset (default to empty state so the user can enter fresh records)
  useEffect(() => {
    const cachedArrivals = localStorage.getItem("tourops_arrivals_v3");
    const cachedDepartures = localStorage.getItem("tourops_departures_v3");
    const cachedAttendance = localStorage.getItem("tourops_attendance_v3");

    if (cachedArrivals) {
      setArrivals(JSON.parse(cachedArrivals));
    } else {
      setArrivals([]);
      localStorage.setItem("tourops_arrivals_v3", JSON.stringify([]));
    }

    if (cachedDepartures) {
      setDepartures(JSON.parse(cachedDepartures));
    } else {
      setDepartures([]);
      localStorage.setItem("tourops_departures_v3", JSON.stringify([]));
    }

    if (cachedAttendance) {
      setAttendance(JSON.parse(cachedAttendance));
    } else {
      setAttendance([]);
      localStorage.setItem("tourops_attendance_v3", JSON.stringify([]));
    }
  }, []);

  // Sync back to local storage whenever state changes
  const saveToStorage = (type: "arr" | "dep" | "att", data: any) => {
    if (type === "arr") {
      localStorage.setItem("tourops_arrivals_v3", JSON.stringify(data));
    } else if (type === "dep") {
      localStorage.setItem("tourops_departures_v3", JSON.stringify(data));
    } else if (type === "att") {
      localStorage.setItem("tourops_attendance_v3", JSON.stringify(data));
    }
  };

  // Logbook helper functions for locking past dates
  const handleSetLogbookDate = (newDate: string) => {
    if (!newDate) return;
    
    const nextLocked = [...lockedDates];
    // If we are advancing to a future date, lock the old active logbook date!
    if (activeLogbookDate && newDate > activeLogbookDate) {
      if (!nextLocked.includes(activeLogbookDate)) {
        nextLocked.push(activeLogbookDate);
      }
      // Also Lock other older dates from records
      arrivals.forEach((r) => {
        if (r.date < newDate && !nextLocked.includes(r.date)) {
          nextLocked.push(r.date);
        }
      });
      departures.forEach((d) => {
        if (d.date < newDate && !nextLocked.includes(d.date)) {
          nextLocked.push(d.date);
        }
      });
    }

    setLockedDates(nextLocked);
    localStorage.setItem("tourops_locked_dates", JSON.stringify(nextLocked));

    setActiveLogbookDate(newDate);
    localStorage.setItem("tourops_active_logbook_date", newDate);
  };

  const shiftLogbookDate = (diff: number) => {
    try {
      const parts = activeLogbookDate.split("-");
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      d.setDate(d.getDate() + diff);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const newDate = `${year}-${month}-${day}`;
      handleSetLogbookDate(newDate);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoToToday = () => {
    handleSetLogbookDate("2026-06-13");
  };

  // Helper to completely clear all spreadsheet records
  const handleClearAllData = () => {
    if (confirm(t.alertClearConfirm)) {
      setArrivals([]);
      setDepartures([]);
      setAttendance([]);
      setLockedDates([]);
      setActiveLogbookDate("2026-06-13");
      
      localStorage.setItem("tourops_arrivals_v3", JSON.stringify([]));
      localStorage.setItem("tourops_departures_v3", JSON.stringify([]));
      localStorage.setItem("tourops_attendance_v3", JSON.stringify([]));
      localStorage.setItem("tourops_locked_dates", JSON.stringify([]));
      localStorage.setItem("tourops_active_logbook_date", "2026-06-13");
      
      setSearchQuery("");
      alert(t.alertClearSuccess);
    }
  };

  // Demo loading has been removed as requested

  const isDateLocked = (d: string) => {
    return lockedDates.includes(d) || d < activeLogbookDate;
  };

  // 5. Operations: ARRIVALS
  const handleAddArrival = (newArr: Omit<ArrivalRecord, "id">) => {
    if (isDateLocked(newArr.date)) {
      alert(t.lockWarningNotification);
      return;
    }
    const record: ArrivalRecord = {
      ...newArr,
      id: `arr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    const updated = [...arrivals, record];
    setArrivals(updated);
    saveToStorage("arr", updated);
  };

  const handleUpdateArrival = (id: string, updatedFields: Partial<ArrivalRecord>) => {
    const existing = arrivals.find((row) => row.id === id);
    if (existing) {
      if (isDateLocked(existing.date)) {
        alert(t.lockWarningNotification);
        return;
      }
      if (updatedFields.date && isDateLocked(updatedFields.date)) {
        alert(t.lockWarningNotification);
        return;
      }
    }
    const updated = arrivals.map((row) => (row.id === id ? { ...row, ...updatedFields } : row));
    setArrivals(updated);
    saveToStorage("arr", updated);
  };

  const handleDeleteArrival = (id: string) => {
    const existing = arrivals.find((row) => row.id === id);
    if (existing && isDateLocked(existing.date)) {
      alert(t.lockWarningNotification);
      return;
    }
    const updated = arrivals.filter((row) => row.id !== id);
    setArrivals(updated);
    saveToStorage("arr", updated);
  };

  const handleAddEmptyArrivalRow = (dateStr: string) => {
    if (isDateLocked(dateStr)) {
      alert(t.lockWarningNotification);
      return;
    }
    const blankRow: ArrivalRecord = {
      id: `arr-blank-${Date.now()}`,
      date: dateStr,
      name: "",
      pax: 1,
      avail: "RT Transfer",
      number: "",
      hotel: "Enter Hotel Name",
      eta: "12:00 PM",
      collect: "N/A",
      epay: "",
      activities: "",
      local: "",
      foreign: "",
      discounted: ""
    };
    const updated = [...arrivals, blankRow];
    setArrivals(updated);
    saveToStorage("arr", updated);
  };

  // 6. Operations: DEPARTURES
  const handleAddDeparture = (newDep: Omit<DepartureRecord, "id">) => {
    if (isDateLocked(newDep.date)) {
      alert(t.lockWarningNotification);
      return;
    }
    const record: DepartureRecord = {
      ...newDep,
      id: `dep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    const updated = [...departures, record];
    setDepartures(updated);
    saveToStorage("dep", updated);
  };

  const handleUpdateDeparture = (id: string, updatedFields: Partial<DepartureRecord>) => {
    const existing = departures.find((row) => row.id === id);
    if (existing) {
      if (isDateLocked(existing.date)) {
        alert(t.lockWarningNotification);
        return;
      }
      if (updatedFields.date && isDateLocked(updatedFields.date)) {
        alert(t.lockWarningNotification);
        return;
      }
    }
    const updated = departures.map((row) => (row.id === id ? { ...row, ...updatedFields } : row));
    setDepartures(updated);
    saveToStorage("dep", updated);
  };

  const handleDeleteDeparture = (id: string) => {
    const existing = departures.find((row) => row.id === id);
    if (existing && isDateLocked(existing.date)) {
      alert(t.lockWarningNotification);
      return;
    }
    const updated = departures.filter((row) => row.id !== id);
    setDepartures(updated);
    saveToStorage("dep", updated);
  };

  const handleAddEmptyDepartureRow = (dateStr: string) => {
    if (isDateLocked(dateStr)) {
      alert(t.lockWarningNotification);
      return;
    }
    const blankRow: DepartureRecord = {
      id: `dep-blank-${Date.now()}`,
      date: dateStr,
      name: "",
      pax: 1,
      avail: "RT Outbound Transfer",
      number: "",
      hotel: "Enter Hotel Name",
      etd: "12:00 PM",
      pickupTime: "09:00 AM",
      page: "",
      leadGuest: "",
      unit: "",
      others: ""
    };
    const updated = [...departures, blankRow];
    setDepartures(updated);
    saveToStorage("dep", updated);
  };

  // 7. Operations: ATTENDANCE
  const handleUpdateAttendance = (employeeId: string, dateStr: string, log: AttendanceDayLog | null) => {
    if (isDateLocked(dateStr)) {
      alert(t.lockWarningNotification);
      return;
    }
    const updated = attendance.map((emp) => {
      if (emp.id !== employeeId) return emp;
      
      const nextLogs = { ...emp.logs };
      if (log === null) {
        delete nextLogs[dateStr];
      } else {
        nextLogs[dateStr] = log;
      }
      return { ...emp, logs: nextLogs };
    });
    
    setAttendance(updated);
    saveToStorage("att", updated);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    const updated = attendance.filter((emp) => emp.id !== employeeId);
    setAttendance(updated);
    saveToStorage("att", updated);
  };

  const handleUpdateEmployeeName = (employeeId: string, newName: string) => {
    const updated = attendance.map((emp) => (emp.id === employeeId ? { ...emp, name: newName } : emp));
    setAttendance(updated);
    saveToStorage("att", updated);
  };

  const handleAddEmployee = (name: string) => {
    const newEmp: EmployeeAttendance = {
      id: `emp-${Date.now()}`,
      name,
      logs: {}
    };
    const updated = [...attendance, newEmp];
    setAttendance(updated);
    saveToStorage("att", updated);
  };

  // Global filtered arrays depending on currently selected logbook date
  const viewArrivals = arrivals.filter((a) => a.date === activeLogbookDate);
  const viewDepartures = departures.filter((d) => d.date === activeLogbookDate);

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-[#1A1A1A] font-sans antialiased pb-16">
      
      {/* 🟢 TOP NAVIGATION HEADER */}
      <header className="bg-white border-b border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1A1A1A] p-2 rounded-none text-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <FileSpreadsheet className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="font-serif font-black text-2xl uppercase tracking-tighter leading-none italic select-none text-black">
                  {t.title}
                </h1>
                <span className="bg-[#1A1A1A] text-white text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {t.versionBadge}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Header Right Widgets */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Language Switch */}
            <div className="flex border-2 border-black bg-white p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <button
                onClick={() => changeLanguage("en")}
                className={`px-2 py-1.5 text-[10px] font-mono font-black uppercase transition-all cursor-pointer ${
                  language === "en"
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-neutral-100"
                }`}
                title="Switch to English"
              >
                ENGLISH (EN)
              </button>
              <button
                onClick={() => changeLanguage("tl")}
                className={`px-2 py-1.5 text-[10px] font-mono font-black uppercase transition-all cursor-pointer ${
                  language === "tl"
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-neutral-100"
                }`}
                title="Lumipat sa Tagalog"
              >
                TAGALOG (TL)
              </button>
            </div>

            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-[#1A1A1A] hover:text-black transition-colors px-3 py-1.5 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 border-2 border-black bg-[#FAFAFA] hover:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              title="Show / Hide Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-black" />
              {t.guideButton}
            </button>
            <button
              onClick={handleClearAllData}
              className="bg-red-600 text-white hover:bg-red-700 px-3 py-1.5 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              title="Empty the records"
            >
              <span>🗑️</span> {t.clearButton}
            </button>
          </div>
        </div>
      </header>

      {/* 🟢 MAIN WORKSPACE CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Help / Gabay Alert Panel */}
        {showHelp && (
          <div className="bg-white border-2 border-black p-5 mb-6 text-[#1A1A1A] relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-4 items-start rounded-none">
            <div className="bg-amber-100 border border-black p-2 rounded-none shrink-0">
              <Info className="w-5.5 h-5.5 text-slate-900" />
            </div>
            <div className="flex-1 space-y-1 text-xs">
              <div className="flex justify-between items-center border-b border-black pb-1.5 mb-2">
                <h4 className="font-serif font-black italic text-base uppercase tracking-tight text-black">
                  {t.guideTitle}
                </h4>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="text-gray-500 hover:text-black font-black px-1.5 py-0.5 border border-black cursor-pointer text-xs uppercase"
                >
                  {t.hideButton}
                </button>
              </div>
              <p className="text-[#1A1A1A] leading-relaxed max-w-4xl text-xs">
                {t.guideIntro}
              </p>
              <ul className="list-disc pl-4 space-y-1 pr-1 text-slate-800 pt-1 text-[11px] font-mono">
                <li><span className="font-bold text-black uppercase">{t.guideCellEdit}</span> {t.guideCellEditText}</li>
                <li><span className="font-bold text-black uppercase">{t.guideInsertRow}</span> {t.guideInsertRowText}</li>
                <li><span className="font-bold text-black uppercase">{t.guideAutoSave}</span> {t.guideAutoSaveText}</li>
              </ul>
            </div>
          </div>
        )}

        {/* 📅 DAILY LOGBOOK CONTROLLER */}
        <div className="bg-[#FFF9E6] border-2 border-black p-4 sm:p-5 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-black pb-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-amber-300 p-2.5 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <CalendarDays className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-serif font-black italic text-base uppercase tracking-tight text-black flex items-center gap-2">
                  {t.logbookTitle}
                </h3>
                <p className="text-[10px] text-gray-600 font-mono font-bold uppercase tracking-wider">
                  {t.logbookSub}
                </p>
              </div>
            </div>
            {/* Display list of locked dates as small helper capsules as reference */}
            <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono font-bold">
              <span className="text-gray-500 uppercase">🔒 Naka-lock:</span>
              {lockedDates.length === 0 ? (
                <span className="bg-white border border-black px-1.5 py-0.5 text-gray-400 font-normal">WALA PA</span>
              ) : (
                lockedDates.map((ld) => (
                  <span key={ld} className="bg-red-100 text-red-800 border border-red-300 px-1.5 py-0.5 uppercase">
                    {ld}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Active Date Panel with Switchers */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono font-black text-amber-950 uppercase tracking-widest">
                  {t.activeDateLabel}
                </span>
                <span className="text-lg font-serif font-black italic text-black uppercase mt-0.5">
                  {activeLogbookDate}
                </span>
              </div>

              {/* Day switch buttons */}
              <div className="flex border-2 border-black bg-white shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] rounded-none">
                <button
                  onClick={() => shiftLogbookDate(-1)}
                  className="px-3 py-2 text-xs font-mono font-black uppercase border-r-2 border-black hover:bg-amber-100 text-black cursor-pointer transition-colors"
                >
                  {t.btnPreviousDay}
                </button>
                <button
                  onClick={handleGoToToday}
                  className="px-3 py-2 text-xs font-mono font-black uppercase border-r-2 border-black hover:bg-amber-100 text-black cursor-pointer transition-colors"
                >
                  {t.btnToday}
                </button>
                <button
                  onClick={() => shiftLogbookDate(1)}
                  className="px-3 py-2 text-xs font-mono font-black uppercase hover:bg-amber-100 text-black cursor-pointer transition-colors"
                >
                  {t.btnNextDay}
                </button>
              </div>

              {/* Direct input Date Jump */}
              <div className="flex items-center gap-2 bg-white border-2 border-black px-2 py-1 shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[10px] font-mono font-black text-gray-500 uppercase">LUMIPAT:</span>
                <input
                  type="date"
                  value={activeLogbookDate}
                  onChange={(e) => handleSetLogbookDate(e.target.value)}
                  className="text-xs font-mono font-bold bg-transparent outline-none text-black cursor-pointer uppercase py-0.5 pr-1 border-0"
                />
              </div>
            </div>

            {/* Quick Lock/Freeze Reminder status badge */}
            <div className="flex items-center gap-2 bg-white p-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse border border-black inline-block shrink-0" />
              <div className="text-[10px] font-mono leading-tight">
                <span className="font-black uppercase text-emerald-800 block">
                  {t.lockStatusActive}
                </span>
                <span className="text-gray-500 font-bold uppercase block text-[8px] tracking-wider mt-0.5">
                  Tatanggap ng mga bagong records para sa petsang ito.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Indicator summaries */}
        <DashboardStats 
          arrivals={arrivals} 
          departures={departures} 
          attendance={attendance} 
          onDeleteArrival={handleDeleteArrival}
          onUpdateArrival={handleUpdateArrival}
          language={language}
          activeLogbookDate={activeLogbookDate}
        />

        {/* Primary Data Input Encoder Panel */}
        <ExcelInputForm 
          onSaveArrival={handleAddArrival} 
          onSaveDeparture={handleAddDeparture} 
          onAddEmployee={handleAddEmployee}
          onUpdateAttendance={handleUpdateAttendance}
          employees={attendance}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
          activeLogbookDate={activeLogbookDate}
          lockedDates={lockedDates}
        />

        {/* 🟢 EXCEL SEARCH & FILTER UTILITY BAR */}
        <div className="bg-[#FAFAFA] border border-black p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          
          {/* Left search tools */}
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-black">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full text-xs font-mono placeholder-gray-500 border border-black rounded-none pl-9 pr-3 py-2 bg-white uppercase font-bold outline-none text-black"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 font-bold text-gray-500 hover:text-black text-xs uppercase cursor-pointer"
                >
                  {t.btnClearSearch}
                </button>
              )}
            </div>
            
            {/* Global Date Sorter filter */}
            <div className="flex items-center gap-1.5 shrink-0 bg-white border border-black px-2 py-1.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
              <CalendarDays className="w-4 h-4 text-emerald-800" />
              <span className="text-[10px] font-mono font-black text-gray-500 uppercase">Araw:</span>
              <input
                type="date"
                value={activeLogbookDate}
                onChange={(e) => handleSetLogbookDate(e.target.value)}
                className="text-xs font-mono font-bold bg-transparent border-0 outline-none text-black cursor-pointer uppercase"
                title={language === "tl" ? "Pumili ng Araw ng Logbook" : "Select Logbook Date"}
              />
            </div>
          </div>

          {/* Section Section Selector Tabs */}
          <div className="flex border border-black bg-white p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">
            <button
              onClick={() => setActiveTab("arrival")}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 rounded-none border-r border-black font-display ${
                activeTab === "arrival"
                  ? "bg-emerald-100 text-emerald-950"
                  : "text-gray-400 hover:text-black hover:bg-gray-50"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${activeTab === "arrival" ? "bg-emerald-600 animate-pulse" : "bg-emerald-300"}`} />
              {t.tabArrivals}
            </button>
            <button
              onClick={() => setActiveTab("departure")}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 rounded-none border-r border-black font-display ${
                activeTab === "departure"
                  ? "bg-blue-100 text-blue-950"
                  : "text-gray-400 hover:text-black hover:bg-gray-50"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${activeTab === "departure" ? "bg-blue-600 animate-pulse" : "bg-blue-300"}`} />
              {t.tabDepartures}
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 rounded-none font-display ${
                activeTab === "attendance"
                  ? "bg-slate-200 text-slate-950"
                  : "text-gray-400 hover:text-black hover:bg-gray-50"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${activeTab === "attendance" ? "bg-black animate-pulse" : "bg-gray-400"}`} />
              {t.tabPersonnel}
            </button>
          </div>

        </div>

        {/* 🟢 TAB CONTENT PANELS */}
        <div id="spreadsheet-workspace-panel" className="transition-all duration-300">
          {activeTab === "arrival" && (
            <ArrivalTable
              records={viewArrivals}
              onUpdateRecord={handleUpdateArrival}
              onDeleteRecord={handleDeleteArrival}
              onAddEmptyRecord={handleAddEmptyArrivalRow}
              searchQuery={searchQuery}
              language={language}
              activeLogbookDate={activeLogbookDate}
              lockedDates={lockedDates}
            />
          )}

          {activeTab === "departure" && (
            <DepartureTable
              records={viewDepartures}
              onUpdateRecord={handleUpdateDeparture}
              onDeleteRecord={handleDeleteDeparture}
              onAddEmptyRecord={handleAddEmptyDepartureRow}
              searchQuery={searchQuery}
              language={language}
              activeLogbookDate={activeLogbookDate}
              lockedDates={lockedDates}
            />
          )}

          {activeTab === "attendance" && (
            <AttendanceTable
              employees={attendance}
              onUpdateAttendance={handleUpdateAttendance}
              onDeleteEmployee={handleDeleteEmployee}
              onUpdateEmployeeName={handleUpdateEmployeeName}
              onAddEmployee={handleAddEmployee}
              searchQuery={searchQuery}
              language={language}
              activeLogbookDate={activeLogbookDate}
              lockedDates={lockedDates}
            />
          )}
        </div>

      </main>

      {/* Editorial Bottom Status Bar / Footer */}
      <footer className="mt-20 border-t-2 border-black bg-black text-white py-4 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-widest">
          <div className="flex gap-4">
            <span className="text-emerald-400">● ONLINE / STABLE</span>
            <span>DB: LOCALSTORAGE_ACTIVE</span>
            <span>OPERATOR: SECURE_AGENT</span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1.5">
            <div>
              TOUROPS EXCEL SYSTEM © 2026 • REGISTRY MANAGEMENT SYSTEM / V2.5
            </div>
            <div className="text-[9px] tracking-wider text-amber-300 font-mono font-bold uppercase select-none">
              CREATED BY ARJOE SOLIDUM.. COMPUTER SCIENCE DEVELOPER
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
