import React, { useState } from "react";
import { Users, Truck, CheckSquare, ShieldCheck, DollarSign, Trash2, ChevronDown, ChevronUp, AlertCircle, Coins } from "lucide-react";
import { ArrivalRecord, DepartureRecord, EmployeeAttendance, Language } from "../types";
import { translations } from "../translations";

interface DashboardStatsProps {
  arrivals: ArrivalRecord[];
  departures: DepartureRecord[];
  attendance: EmployeeAttendance[];
  onDeleteArrival?: (id: string) => void;
  onUpdateArrival?: (id: string, updatedFields: Partial<ArrivalRecord>) => void;
  language: Language;
  activeLogbookDate: string;
}

export default function DashboardStats({ 
  arrivals, 
  departures, 
  attendance,
  onDeleteArrival,
  onUpdateArrival,
  language,
  activeLogbookDate
}: DashboardStatsProps) {
  const [showCollectiblesPanel, setShowCollectiblesPanel] = useState(false);
  const t = translations[language];

  // Filter arrivals and departures by selected active logbook date
  const activeArrivals = arrivals.filter((item) => item.date === activeLogbookDate);
  const activeDepartures = departures.filter((item) => item.date === activeLogbookDate);

  // 1. Calculate Arrivals summary
  const totalArrivalBookings = activeArrivals.length;
  const totalArrivalPax = activeArrivals.reduce((sum, item) => sum + (item.pax || 0), 0);

  // 2. Calculate Departures summary
  const totalDepartureBookings = activeDepartures.length;
  const totalDeparturePax = activeDepartures.reduce((sum, item) => sum + (item.pax || 0), 0);

  // 3. Count employees with active duty logs registered today
  const activePersonnel = attendance.length;
  const totalLogsRegistered = attendance.reduce((sum, emp) => {
    const hasLogToday = emp.logs && emp.logs[activeLogbookDate];
    return sum + (hasLogToday ? 1 : 0);
  }, 0);

  // 4. Summarize Collect payments & collect records
  let totalCollectPHPValue = 0;
  let paidCount = 0;
  let collectCount = 0;

  // Filter records that have actual collectible values and belong to the activeLogbookDate
  const collectibleRecords = arrivals.filter((item) => {
    if (item.date !== activeLogbookDate) return false;
    const rawCollect = (item.collect || "").toUpperCase().trim();
    if (!rawCollect || rawCollect === "N/A" || rawCollect === "--" || rawCollect === "NONE" || rawCollect === "S/D") {
      return false;
    }
    return true;
  });

  arrivals.forEach((item) => {
    if (item.date !== activeLogbookDate) return;
    const rawCollect = (item.collect || "").toUpperCase();
    if (rawCollect.includes("PAY") || rawCollect.includes("COLLECT") || rawCollect.includes("PHP") || rawCollect.includes("₱") || (!rawCollect.includes("PAID") && !rawCollect.includes("NABAYARAN") && rawCollect !== "N/A" && rawCollect !== "--" && rawCollect.trim() !== "")) {
      // Find numeric values if possible
      const match = rawCollect.match(/\d+(?:,\d+)*/g);
      if (match) {
        match.forEach((numStr) => {
          const cleanNum = parseFloat(numStr.replace(/,/g, ""));
          if (!isNaN(cleanNum)) {
            totalCollectPHPValue += cleanNum;
          }
        });
      }
    }
    
    if (rawCollect.includes("PAID") || rawCollect.includes("NABAYARAN")) {
      paidCount++;
    } else if (rawCollect !== "N/A" && rawCollect !== "--" && rawCollect.trim() !== "") {
      collectCount++;
    }
  });

  const handleDeleteRecord = (id: string, name: string) => {
    if (onDeleteArrival) {
      onDeleteArrival(id);
    }
  };

  const handleClearCollectible = (id: string, name: string) => {
    if (onUpdateArrival) {
      onUpdateArrival(id, { collect: "N/A" });
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div id="dashboard-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Arrivals Indicator */}
        <div className="bg-emerald-50 text-emerald-950 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none rounded-none">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block">
              {t.statArrivalSegments}
            </span>
            <h3 className="text-3xl font-serif font-black italic mt-1 text-black">
              {totalArrivalPax} <span className="text-xs font-mono font-bold uppercase not-italic text-emerald-900">{t.paxLabel}</span>
            </h3>
            <p className="text-[10px] text-emerald-900 font-bold uppercase tracking-tight mt-1 font-mono">
              {totalArrivalBookings} {t.statGroupsOrganized}
            </p>
          </div>
          <div className="bg-white border border-black p-2.5 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[#1A1A1A]">
            <Users className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Departures Indicator */}
        <div className="bg-blue-50 text-blue-950 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none rounded-none">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-800 block">
              {t.statDepartureOutbounds}
            </span>
            <h3 className="text-3xl font-serif font-black italic mt-1 text-black">
              {totalDeparturePax} <span className="text-xs font-mono font-bold uppercase not-italic text-blue-900">{t.paxLabel}</span>
            </h3>
            <p className="text-[10px] text-blue-900 font-bold uppercase tracking-tight mt-1 font-mono">
              {totalDepartureBookings} {t.statPickupsArranged}
            </p>
          </div>
          <div className="bg-white border border-black p-2.5 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[#1A1A1A]">
            <Truck className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Manpower Indicator */}
        <div className="bg-neutral-100 text-slate-900 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none rounded-none">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">
              {t.statCrewsPersonnel}
            </span>
            <h3 className="text-3xl font-serif font-black italic mt-1 text-black">
              {activePersonnel} <span className="text-xs font-mono font-bold uppercase not-italic text-slate-800">{t.crewsLabel || "Crews"}</span>
            </h3>
            <p className="text-[10px] text-slate-800 font-bold uppercase tracking-tight mt-1 font-mono">
              {totalLogsRegistered} {t.statActiveDutyLogs}
            </p>
          </div>
          <div className="bg-white border border-black p-2.5 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[#1A1A1A]">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
        </div>        {/* Financial indicator */}
        <button
          onClick={() => setShowCollectiblesPanel(!showCollectiblesPanel)}
          className={`w-full text-left p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer rounded-none outline-none ${
            showCollectiblesPanel ? "bg-amber-100 text-amber-950 ring-2 ring-black" : "bg-amber-50 text-slate-933 hover:bg-amber-100"
          }`}
          title="Track estimated receivables sheet"
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 flex items-center gap-1.5">
              {language === "tl" ? `KITA AT SINGILIN (${activeLogbookDate})` : `COLLECTIONS & COLLECTIBLES (${activeLogbookDate})`}
              {showCollectiblesPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
            <h3 className="text-2xl font-serif font-black italic mt-1 text-black">
              ₱{totalCollectPHPValue.toLocaleString()} <span className="text-xs font-mono font-bold uppercase not-italic text-slate-800">PHP</span>
            </h3>
            <p className="text-[10px] text-amber-900 font-bold uppercase tracking-tight mt-1 font-mono flex items-center gap-1">
              <span className="underline">{collectibleRecords.length} {t.statListado}</span> • {collectCount} {t.statToCollect} • {paidCount} {t.statPaid}
            </p>
          </div>
          <div className="bg-white border border-black p-2.5 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[#1A1A1A]">
            <DollarSign className="w-5.5 h-5.5" />
          </div>
        </button>
      </div>

      {/* Expandable Collectibles Management & Eraser Board */}
      {showCollectiblesPanel && (
        <div className="bg-white border-2 border-black p-4 md:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-black pb-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-amber-100 p-2 border border-black text-amber-950">
                <Coins className="w-5.5 h-5.5 text-black" />
              </div>
              <div>
                <h4 className="font-serif font-black italic text-sm uppercase tracking-tight text-black flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping inline-block" />
                  {t.statManageCollectiblesTitle} &middot; <span className="text-rose-750 uppercase font-mono">{activeLogbookDate}</span>
                </h4>
                <p className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">
                  {t.statManageCollectiblesDesc} &middot; {language === "tl" ? "Tanging mga rekord ng petsang ito ang nakalista." : "Only records of this selected date are processed."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCollectiblesPanel(false)}
              className="text-xs font-mono font-black border border-black px-2 py-1 hover:bg-neutral-100 uppercase cursor-pointer text-black"
            >
              {t.hideButton}
            </button>
          </div>

          {collectibleRecords.length === 0 ? (
            <div className="p-6 text-center text-gray-500 bg-neutral-55 border border-black font-mono text-xs">
              <AlertCircle className="w-6 h-6 mx-auto mb-1 text-black" />
              {t.statManageCollectiblesEmpty}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-black">
                <thead>
                  <tr className="bg-[#FFFF00] text-black font-mono text-[9px] uppercase font-bold tracking-wider border-b border-black">
                    <th className="py-2 px-3 border-r border-black w-24 text-center">{t.tableDate}</th>
                    <th className="py-2 px-3 border-r border-black">{t.tableName}</th>
                    <th className="py-2 px-3 border-r border-black">{t.tableService}</th>
                    <th className="py-2 px-3 border-r border-black">{t.tableHotel}</th>
                    <th className="py-2 px-3 border-r border-black text-center w-12">{t.tablePax}</th>
                    <th className="py-2 px-3 border-r border-black text-rose-800">{t.tableCollect}</th>
                    <th className="py-2 px-3 text-center w-52">{t.tableCorrectiveAction}</th>
                  </tr>
                </thead>
                <tbody className="font-sans text-xs divide-y divide-black bg-white">
                  {collectibleRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="p-2 border-r border-black font-mono text-center font-bold text-[11px] whitespace-nowrap text-black">
                        {item.date}
                      </td>
                      <td className="p-2 border-r border-black font-bold text-black uppercase">
                        {item.name || <span className="text-gray-400 italic">[No Name]</span>}
                      </td>
                      <td className="p-2 border-r border-black font-mono text-slate-700 text-[11px]">
                        {item.avail}
                      </td>
                      <td className="p-2 border-r border-black font-medium text-black uppercase max-w-[150px] truncate">
                        {item.hotel}
                      </td>
                      <td className="p-2 border-r border-black text-center font-mono font-bold text-black">
                        {item.pax}
                      </td>
                      <td className="p-2 border-r border-black font-mono font-black text-rose-800 uppercase bg-amber-50/40">
                        {item.collect}
                      </td>
                      <td className="p-2 text-center whitespace-nowrap space-x-2">
                        {/* Clear/Reset Collect value button */}
                        <button
                          onClick={() => handleClearCollectible(item.id, item.name)}
                          disabled={!onUpdateArrival}
                          className="bg-white hover:bg-amber-50 text-black border border-black px-2 py-1 font-mono font-bold text-[10px] uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none focus:outline-hidden disabled:opacity-50 transition-all cursor-pointer inline-flex items-center gap-1"
                          title="Restore to default/empty state"
                        >
                          {t.btnClearCollect}
                        </button>
                        {/* Final Delete Record button */}
                        <button
                          onClick={() => handleDeleteRecord(item.id, item.name)}
                          disabled={!onDeleteArrival}
                          className="bg-rose-600 hover:bg-rose-700 text-white border border-black px-2 py-1 font-mono font-bold text-[10px] uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none focus:outline-hidden disabled:opacity-50 transition-all cursor-pointer inline-flex items-center gap-1"
                          title="Delete full row"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                          {t.btnDeleteRecord}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
