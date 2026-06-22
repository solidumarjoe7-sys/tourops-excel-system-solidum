import React, { useState } from "react";
import { Trash2, Plus, Calendar, Download, AlertCircle } from "lucide-react";
import { DepartureRecord, Language } from "../types";
import { formatDateLabel, exportDeparturesToCSV } from "../utils";
import { translations } from "../translations";

interface DepartureTableProps {
  records: DepartureRecord[];
  onUpdateRecord: (id: string, updatedFields: Partial<DepartureRecord>) => void;
  onDeleteRecord: (id: string) => void;
  onAddEmptyRecord: (date: string) => void;
  searchQuery: string;
  language: Language;
  activeLogbookDate: string;
  lockedDates: string[];
}

export default function DepartureTable({
  records,
  onUpdateRecord,
  onDeleteRecord,
  onAddEmptyRecord,
  searchQuery,
  language,
  activeLogbookDate,
  lockedDates
}: DepartureTableProps) {
  const t = translations[language];
  // Track cell selection for inline spreadsheets
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof DepartureRecord } | null>(null);
  const [tempValue, setTempValue] = useState<string>("");

  const isDateLocked = (d: string) => {
    return lockedDates.includes(d) || d < activeLogbookDate;
  };

  const handleCellClick = (id: string, field: keyof DepartureRecord, value: any, dateString: string) => {
    if (isDateLocked(dateString)) return;
    setEditingCell({ id, field });
    setTempValue(String(value));
  };

  const handleCellSave = (id: string, field: keyof DepartureRecord) => {
    if (!editingCell) return;
    
    let parsedValue: any = tempValue;
    if (field === "pax") {
      parsedValue = Math.max(1, Number(tempValue) || 1);
    }
    
    onUpdateRecord(id, { [field]: parsedValue });
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string, field: keyof DepartureRecord) => {
    if (e.key === "Enter") {
      handleCellSave(id, field);
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  // Search filter
  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.date.includes(q) ||
      r.hotel.toLowerCase().includes(q) ||
      r.avail.toLowerCase().includes(q) ||
      r.number.toLowerCase().includes(q) ||
      (r.etd && r.etd.toLowerCase().includes(q)) ||
      (r.pickupTime && r.pickupTime.toLowerCase().includes(q))
    );
  });

  // Group by Date
  const groupedRecords: { [date: string]: DepartureRecord[] } = {};
  filteredRecords.forEach((rec) => {
    if (!groupedRecords[rec.date]) {
      groupedRecords[rec.date] = [];
    }
    groupedRecords[rec.date].push(rec);
  });

  const sortedDates = Object.keys(groupedRecords).sort((a, b) => a.localeCompare(b));

  return (
    <div id="departure-records-container" className="space-y-6">
      {/* Table Header and Utilities */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-blue-50 border-2 border-black p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <h2 className="text-sm font-serif font-black italic text-black flex items-center gap-2 uppercase tracking-wide">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse border border-black" />
            {t.secBTitle}
          </h2>
          <p className="text-[10px] text-blue-955 font-bold uppercase tracking-wider font-mono mt-0.5">
            {t.secBSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportDeparturesToCSV(records)}
            className="bg-black text-white hover:bg-neutral-800 px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-colors cursor-pointer rounded-none"
          >
            <Download className="w-4 h-4 text-white" />
            {language === "tl" ? "I-EXPORT SA EXCEL (.CSV)" : "EXPORT TO EXCEL (.CSV)"}
          </button>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div className="bg-white border-2 border-black p-8 text-center text-gray-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <AlertCircle className="w-8 h-8 text-black mx-auto mb-2" />
          <p className="text-xs font-bold uppercase tracking-wider text-black">{t.noDepartureFound}</p>
          <p className="text-[11px] font-mono mt-1 text-gray-500">{t.noDepartureFoundDesc}</p>
        </div>
      ) : (
        sortedDates.map((dateString) => {
          const groupRecords = groupedRecords[dateString];
          const totalPax = groupRecords.reduce((sum, item) => sum + (item.pax || 0), 0);

          return (
            <div
              key={dateString}
              className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-8 rounded-none"
            >
              {/* Date Group Header */}
              <div className="bg-[#FAFAFA] px-5 py-3.5 border-b-2 border-black flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Calendar className="w-4 h-4 text-black" />
                  <span className="text-sm font-serif font-black italic uppercase tracking-tight text-black">
                    {formatDateLabel(dateString)}
                  </span>
                  <span className="bg-white border border-black text-black font-mono font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] select-none">
                    {groupRecords.length} {t.departuresCount}{groupRecords.length > 1 && language === "en" ? "s" : ""}
                  </span>
                  <span className="bg-white border border-black text-black font-mono font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] select-none">
                    {totalPax} {t.paxTotal}
                  </span>
                </div>
                
                {/* Spreadsheet style row adder */}
                {isDateLocked(dateString) ? (
                  <span className="bg-rose-50 text-rose-700 font-mono font-bold text-[9px] border border-rose-300 px-2 py-1 flex items-center gap-1 select-none shadow-[1.5px_1.5px_0px_0px_rgba(253,242,242,1)] uppercase">
                    🔒 {t.lockStatusLocked}
                  </span>
                ) : (
                  <button
                    onClick={() => onAddEmptyRecord(dateString)}
                    className="bg-white hover:bg-sky-50 text-black border border-black px-3 py-1 font-mono font-bold text-[10px] uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer rounded-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t.insertBlankRow}
                  </button>
                )}
              </div>

              {/* SpreadSheet Table Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <thead>
                    {/* Primary Excel section header row */}
                    <tr className="bg-white text-black text-xs font-sans select-none">
                      <th className="border-b border-r border-black bg-white w-28"></th>
                      <th
                        colSpan={11}
                        className="py-1 px-4 border-b border-r border-black bg-[#BDD7EE] text-[#FF0000] text-center font-bold text-[11px] tracking-wider uppercase font-sans leading-relaxed"
                      >
                        {language === "tl" ? "DEPARTURE (PAG-ALIS)" : "DEPARTURE"}
                      </th>
                      <th className="border-b border-black bg-white w-14"></th>
                    </tr>
                    {/* Secondary Excel column labels row */}
                    <tr className="bg-[#FFFF00] text-black font-sans text-[10px] uppercase font-bold tracking-wider border-b border-black select-none">
                      <th className="py-2 px-3 border-r border-black text-center font-black w-28 text-black">{t.colDate}</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[200px]">{t.colGuest}</th>
                      <th className="py-2 px-3 border-r border-black text-center font-black text-black w-16">{t.colPax}</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[160px]">{t.colService}</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[130px]">{t.colPhone}</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[160px]">{t.colRecovery}</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black w-24 text-center">{t.colETD || "ETD"}</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[140px] text-center">{t.colPickup}</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[100px] text-center font-bold">PAGE</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[160px] text-center font-bold">LEAD GUEST</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[100px] text-center font-bold">UNIT</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[140px] text-center font-bold">OTHERS</th>
                      <th className="py-2 px-3 text-center w-14 font-black text-black bg-white">{t.actionHeader}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black font-sans text-xs">
                    {groupRecords.map((row) => {
                      const rowLocked = isDateLocked(dateString);
                      const editableCellClass = rowLocked 
                        ? "py-1 px-1.5 cursor-not-allowed opacity-75 text-stone-500" 
                        : "py-1 px-1.5 hover:bg-amber-100 transition-colors cursor-pointer";

                      return (
                        <tr
                          key={row.id}
                          className={`group transition-colors odd:bg-white even:bg-neutral-50 ${rowLocked ? "bg-stone-50/50" : "hover:bg-amber-50/20"}`}
                        >
                          {/* DATE CELL */}
                          <td className="p-2 border-r border-black align-middle font-mono font-bold">
                            {editingCell?.id === row.id && editingCell?.field === "date" ? (
                              <input
                                type="date"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "date")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "date")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-black font-mono font-bold uppercase"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "date", row.date, dateString)}
                                className={`${editableCellClass} font-mono font-bold text-slate-800 overflow-hidden text-ellipsis whitespace-nowrap uppercase`}
                                title={rowLocked ? t.lockStatusLocked : t.clickToEditDate}
                              >
                                {row.date}
                              </div>
                            )}
                          </td>

                          {/* NAME CELL */}
                          <td className="p-2 border-r border-black align-middle font-bold">
                            {editingCell?.id === row.id && editingCell?.field === "name" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "name")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "name")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-black font-bold uppercase"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "name", row.name, dateString)}
                                className={`${editableCellClass} font-bold overflow-hidden text-ellipsis whitespace-nowrap ${rowLocked ? "text-stone-500" : "text-black"}`}
                                title={rowLocked ? t.lockStatusLocked : t.clickToEditName}
                              >
                                {row.name || (
                                  <span className="text-gray-400 italic font-medium">[Double-click to edit]</span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* PAX CELL */}
                          <td className="p-2 border-r border-black text-center align-middle">
                            {editingCell?.id === row.id && editingCell?.field === "pax" ? (
                              <input
                                type="number"
                                min="1"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "pax")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "pax")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-14 p-1 text-xs text-center border border-black rounded-none focus:outline-hidden bg-white text-black font-mono font-bold"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "pax", row.pax, dateString)}
                                className={`${editableCellClass} text-center font-black font-mono ${rowLocked ? "text-stone-500" : "text-black"}`}
                                title={rowLocked ? t.lockStatusLocked : t.clickToEditPax}
                              >
                                {row.pax}
                              </div>
                            )}
                          </td>

                          {/* AVAIL CELL */}
                          <td className="p-2 border-r border-black align-middle font-bold">
                            {editingCell?.id === row.id && editingCell?.field === "avail" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "avail")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "avail")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-black font-bold uppercase"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "avail", row.avail, dateString)}
                                className={`${editableCellClass} font-bold uppercase ${rowLocked ? "text-stone-400" : "text-blue-800"}`}
                                title={rowLocked ? t.lockStatusLocked : t.clickToEditService}
                              >
                                {row.avail || <span className="text-gray-400 font-medium italic">[Double-click]</span>}
                              </div>
                            )}
                          </td>

                          {/* CONTACT NUMBER CELL */}
                          <td className="p-2 border-r border-black align-middle font-mono font-bold text-black">
                            {editingCell?.id === row.id && editingCell?.field === "number" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "number")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "number")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-black font-mono font-bold"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "number", row.number, dateString)}
                                className={`${editableCellClass} font-mono font-bold ${rowLocked ? "text-stone-400" : "text-slate-800"}`}
                                title={rowLocked ? t.lockStatusLocked : t.clickToEditPhone}
                              >
                                {row.number || <span className="text-gray-400 font-medium italic">--</span>}
                              </div>
                            )}
                          </td>

                          {/* HOTEL RECOVERY */}
                          <td className="p-2 border-r border-black align-middle font-bold">
                            {editingCell?.id === row.id && editingCell?.field === "hotel" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "hotel")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "hotel")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-black font-bold uppercase"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "hotel", row.hotel, dateString)}
                                className={`${editableCellClass} font-bold uppercase ${rowLocked ? "text-stone-500" : "text-black"}`}
                                title={rowLocked ? t.lockStatusLocked : t.clickToEditRecovery}
                              >
                                {row.hotel || <span className="text-gray-400 font-medium italic">[Double-click]</span>}
                              </div>
                            )}
                          </td>

                          {/* ETD CELL */}
                          <td className="p-2 border-r border-black align-middle font-black font-mono">
                            {editingCell?.id === row.id && editingCell?.field === "etd" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "etd")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "etd")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-black font-mono font-bold uppercase"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "etd", row.etd, dateString)}
                                className={`${editableCellClass} font-black font-mono uppercase ${rowLocked ? "text-stone-400" : "text-slate-705"}`}
                                title={rowLocked ? t.lockStatusLocked : t.clickToEditETD}
                              >
                                {row.etd || <span className="text-gray-400 font-medium italic">--</span>}
                              </div>
                            )}
                          </td>

                          {/* PICKUP TIME CELL */}
                          <td className="p-2 border-r border-black align-middle font-black font-mono">
                            {editingCell?.id === row.id && editingCell?.field === "pickupTime" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "pickupTime")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "pickupTime")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-blue-750 font-mono font-bold uppercase"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "pickupTime", row.pickupTime, dateString)}
                                className={`${editableCellClass} font-black font-mono uppercase ${rowLocked ? "text-stone-400" : "text-blue-800"}`}
                                title={rowLocked ? t.lockStatusLocked : t.clickToEditPickup}
                              >
                                {row.pickupTime || <span className="text-gray-400 font-medium italic">--</span>}
                              </div>
                            )}
                          </td>

                          {/* PAGE CELL */}
                          <td className="p-2 border-r border-black text-center align-middle font-mono font-bold">
                            {editingCell?.id === row.id && editingCell?.field === "page" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "page")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "page")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-emerald-800 text-center font-bold font-mono"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "page", row.page || "", dateString)}
                                className={`${editableCellClass} text-center font-bold ${rowLocked ? "text-stone-400" : "text-emerald-850"}`}
                                title={rowLocked ? t.lockStatusLocked : "Click to edit Page"}
                              >
                                {row.page || <span className="text-gray-400 font-medium italic">--</span>}
                              </div>
                            )}
                          </td>

                          {/* LEAD GUEST CELL */}
                          <td className="p-2 border-r border-black align-middle font-bold uppercase">
                            {editingCell?.id === row.id && editingCell?.field === "leadGuest" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "leadGuest")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "leadGuest")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-amber-805 font-bold uppercase"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "leadGuest", row.leadGuest || "", dateString)}
                                className={`${editableCellClass} font-bold uppercase ${rowLocked ? "text-stone-400" : "text-amber-850"}`}
                                title={rowLocked ? t.lockStatusLocked : "Click to edit Lead Guest"}
                              >
                                {row.leadGuest || <span className="text-gray-400 font-medium italic">--</span>}
                              </div>
                            )}
                          </td>

                          {/* UNIT CELL */}
                          <td className="p-2 border-r border-black text-center align-middle font-mono font-bold">
                            {editingCell?.id === row.id && editingCell?.field === "unit" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "unit")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "unit")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-blue-800 text-center font-bold"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "unit", row.unit || "", dateString)}
                                className={`${editableCellClass} text-center font-bold ${rowLocked ? "text-stone-400" : "text-blue-850"}`}
                                title={rowLocked ? t.lockStatusLocked : "Click to edit Unit"}
                              >
                                {row.unit || <span className="text-gray-400 font-medium italic">--</span>}
                              </div>
                            )}
                          </td>

                          {/* OTHERS CELL */}
                          <td className="p-2 border-r border-black text-center align-middle font-mono font-bold">
                            {editingCell?.id === row.id && editingCell?.field === "others" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "others")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "others")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-purple-800 text-center font-bold"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "others", row.others || "", dateString)}
                                className={`${editableCellClass} text-center font-bold ${rowLocked ? "text-stone-400" : "text-purple-850"}`}
                                title={rowLocked ? t.lockStatusLocked : "Click to edit Others"}
                              >
                                {row.others || <span className="text-gray-400 font-medium italic">--</span>}
                              </div>
                            )}
                          </td>

                          {/* ACTION CELL */}
                          <td className="py-2 px-3 text-center align-middle">
                            {rowLocked ? (
                              <span className="text-[10px] select-none text-rose-700 font-bold font-mono" title="LOCKED">
                                🔒
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  onDeleteRecord(row.id);
                                }}
                                className="text-black hover:text-rose-750 p-1 bg-white border border-black hover:bg-rose-50 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none font-bold rounded-none transition-all cursor-pointer inline-block"
                                title={t.deleteRowTooltip}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
