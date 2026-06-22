import React, { useState } from "react";
import { Trash2, Plus, Calendar, Download, AlertCircle } from "lucide-react";
import { ArrivalRecord, Language } from "../types";
import { formatDateLabel, exportArrivalsToCSV } from "../utils";
import { translations } from "../translations";

interface ArrivalTableProps {
  records: ArrivalRecord[];
  onUpdateRecord: (id: string, updatedFields: Partial<ArrivalRecord>) => void;
  onDeleteRecord: (id: string) => void;
  onAddEmptyRecord: (date: string) => void;
  searchQuery: string;
  language: Language;
  activeLogbookDate: string;
  lockedDates: string[];
}

export default function ArrivalTable({
  records,
  onUpdateRecord,
  onDeleteRecord,
  onAddEmptyRecord,
  searchQuery,
  language,
  activeLogbookDate,
  lockedDates
}: ArrivalTableProps) {
  const t = translations[language];
  // Track which cell is being edited inline
  // structure: { id: string, field: keyof ArrivalRecord }
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof ArrivalRecord } | null>(null);
  const [tempValue, setTempValue] = useState<string>("");

  const isDateLocked = (d: string) => {
    return lockedDates.includes(d) || d < activeLogbookDate;
  };

  // Start editing cell
  const handleCellClick = (id: string, field: keyof ArrivalRecord, value: any, dateString: string) => {
    if (isDateLocked(dateString)) return;
    setEditingCell({ id, field });
    setTempValue(String(value));
  };

  // Commit changes
  const handleCellSave = (id: string, field: keyof ArrivalRecord) => {
    if (!editingCell) return;
    
    let parsedValue: any = tempValue;
    if (field === "pax") {
      parsedValue = Math.max(1, Number(tempValue) || 1);
    }
    
    onUpdateRecord(id, { [field]: parsedValue });
    setEditingCell(null);
  };

  // Cancel edit when pressing Escape
  const handleKeyDown = (e: React.KeyboardEvent, id: string, field: keyof ArrivalRecord) => {
    if (e.key === "Enter") {
      handleCellSave(id, field);
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  // Filter records based on search query (search by name, hotel, avail, date, collect)
  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.date.includes(q) ||
      r.hotel.toLowerCase().includes(q) ||
      r.avail.toLowerCase().includes(q) ||
      r.number.toLowerCase().includes(q) ||
      (r.collect && r.collect.toLowerCase().includes(q))
    );
  });

  // Group records by Date
  const groupedRecords: { [date: string]: ArrivalRecord[] } = {};
  filteredRecords.forEach((rec) => {
    if (!groupedRecords[rec.date]) {
      groupedRecords[rec.date] = [];
    }
    groupedRecords[rec.date].push(rec);
  });

  // Sort dates in descending or ascending ? Standard is ascending sorted for tours
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => a.localeCompare(b));

  return (
    <div id="arrival-records-container" className="space-y-6">
      {/* Table Header and Excel Utilities */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-emerald-50 border-2 border-black p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <h2 className="text-sm font-serif font-black italic text-black flex items-center gap-2 uppercase tracking-wide">
            <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-pulse border border-black" />
            {t.secATitle}
          </h2>
          <p className="text-[10px] text-emerald-950 font-bold uppercase tracking-wider font-mono mt-0.5">
            {t.secASubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportArrivalsToCSV(records)}
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
          <p className="text-xs font-bold uppercase tracking-wider text-black">{t.noArrivalFound}</p>
          <p className="text-[11px] font-mono mt-1 text-gray-500">{t.noArrivalFoundDesc}</p>
        </div>
      ) : (
        sortedDates.map((dateString) => {
          const groupRecords = groupedRecords[dateString];
          const totalPax = groupRecords.reduce((sum, item) => sum + (item.pax || 0), 0);

          // Calculate day collection
          let dayCollection = 0;
          groupRecords.forEach((item) => {
            const rawCollect = (item.collect || "").toUpperCase().trim();
            if (!rawCollect || rawCollect === "N/A" || rawCollect === "--" || rawCollect === "NONE" || rawCollect === "S/D" || rawCollect === "PAID" || rawCollect === "NABAYARAN") {
              return;
            }
            const match = rawCollect.match(/\d+(?:,\d+)*/g);
            if (match) {
              match.forEach((numStr) => {
                const cleanNum = parseFloat(numStr.replace(/,/g, ""));
                if (!isNaN(cleanNum)) {
                  dayCollection += cleanNum;
                }
              });
            }
          });

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
                    {groupRecords.length} {t.bookingsCount}{groupRecords.length > 1 && language === "en" ? "s" : ""}
                  </span>
                  <span className="bg-white border border-black text-black font-mono font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] select-none">
                    {totalPax} {t.paxTotal}
                  </span>
                  <span className="bg-amber-100 border border-black text-amber-950 font-mono font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] select-none flex items-center gap-1">
                    💰 {language === "tl" ? "KITA:" : "KITA / COLL:"} ₱{dayCollection.toLocaleString()}
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
                    className="bg-white hover:bg-emerald-50 text-black border border-black px-3 py-1 font-mono font-bold text-[10px] uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer rounded-none"
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
                        colSpan={12}
                        className="py-1 px-4 border-b border-r border-black bg-[#C6EFCE] text-[#006100] text-center font-bold text-[11px] tracking-wider uppercase font-sans leading-relaxed"
                      >
                        {language === "tl" ? "ARRIVAL (PAGDATING)" : "ARRIVAL"}
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
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[160px]">{t.colHotel}</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black w-24 text-center">{t.colETA}</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[140px] text-center font-bold">{language === "tl" ? "SINGILIN" : "COLLECT"}</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[110px] text-center font-bold">E-PAY</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[120px] text-center font-bold">ACTIVITIES</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[80px] text-center font-bold">LOCAL</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[80px] text-center font-bold">FOREIGN</th>
                      <th className="py-2 px-3 border-r border-black font-black text-black min-w-[100px] text-center font-bold">DISCOUNTED</th>
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
                                className={`${editableCellClass} font-bold uppercase ${rowLocked ? "text-stone-400" : "text-emerald-800"}`}
                                title={rowLocked ? t.lockStatusLocked : t.clickToEditService}
                              >
                                {row.avail || <span className="text-gray-400 font-medium italic">[Double-click]</span>}
                              </div>
                            )}
                          </td>

                          {/* CONTACT NUMBER CELL */}
                          <td className="p-2 border-r border-black align-middle font-mono font-bold">
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

                          {/* HOTEL CELL */}
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
                                title={rowLocked ? t.lockStatusLocked : t.clickToEditHotel}
                              >
                                {row.hotel || <span className="text-gray-400 font-medium italic">[Double-click]</span>}
                              </div>
                            )}
                          </td>

                          {/* ETA CELL */}
                          <td className="p-2 border-r border-black align-middle font-black font-mono">
                            {editingCell?.id === row.id && editingCell?.field === "eta" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "eta")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "eta")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-black font-mono font-bold uppercase"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "eta", row.eta, dateString)}
                                className={`${editableCellClass} font-black font-mono uppercase ${rowLocked ? "text-stone-400" : "text-amber-800"}`}
                                title={rowLocked ? t.lockStatusLocked : t.clickToEditETA}
                              >
                                {row.eta || <span className="text-gray-400 font-medium italic">--</span>}
                              </div>
                            )}
                          </td>

                          {/* COLLECT CELL */}
                          <td className="p-2 border-r border-black align-middle font-black font-mono uppercase">
                            {editingCell?.id === row.id && editingCell?.field === "collect" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "collect")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "collect")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-rose-800 font-bold uppercase"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "collect", row.collect, dateString)}
                                className={`${editableCellClass} font-black uppercase ${rowLocked ? "text-stone-400" : "text-rose-800"}`}
                                title={rowLocked ? t.lockStatusLocked : t.clickToEditCollect}
                              >
                                {row.collect || <span className="text-gray-450 font-medium italic">--</span>}
                              </div>
                            )}
                          </td>

                          {/* E-PAY CELL */}
                          <td className="p-2 border-r border-black align-middle font-black font-mono uppercase">
                            {editingCell?.id === row.id && editingCell?.field === "epay" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "epay")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "epay")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-amber-800 font-bold uppercase"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "epay", row.epay || "", dateString)}
                                className={`${editableCellClass} font-black uppercase ${rowLocked ? "text-stone-400" : "text-amber-800"}`}
                                title={rowLocked ? t.lockStatusLocked : "Click to edit E-Pay"}
                              >
                                {row.epay || <span className="text-gray-400 font-medium italic">--</span>}
                              </div>
                            )}
                          </td>

                          {/* ACTIVITIES CELL */}
                          <td className="p-2 border-r border-black align-middle font-bold uppercase">
                            {editingCell?.id === row.id && editingCell?.field === "activities" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "activities")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "activities")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-emerald-800 font-bold uppercase"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "activities", row.activities || "", dateString)}
                                className={`${editableCellClass} font-bold uppercase ${rowLocked ? "text-stone-400" : "text-emerald-800"}`}
                                title={rowLocked ? t.lockStatusLocked : "Click to edit Activities"}
                              >
                                {row.activities || <span className="text-gray-400 font-medium italic">--</span>}
                              </div>
                            )}
                          </td>

                          {/* LOCAL CELL */}
                          <td className="p-2 border-r border-black text-center align-middle font-mono font-bold">
                            {editingCell?.id === row.id && editingCell?.field === "local" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "local")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "local")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-blue-800 text-center font-bold"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "local", row.local || "", dateString)}
                                className={`${editableCellClass} text-center font-bold ${rowLocked ? "text-stone-400" : "text-blue-850"}`}
                                title={rowLocked ? t.lockStatusLocked : "Click to edit Local guests count"}
                              >
                                {row.local || <span className="text-gray-400 font-medium italic">--</span>}
                              </div>
                            )}
                          </td>

                          {/* FOREIGN CELL */}
                          <td className="p-2 border-r border-black text-center align-middle font-mono font-bold">
                            {editingCell?.id === row.id && editingCell?.field === "foreign" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "foreign")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "foreign")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-purple-800 text-center font-bold"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "foreign", row.foreign || "", dateString)}
                                className={`${editableCellClass} text-center font-bold ${rowLocked ? "text-stone-400" : "text-purple-850"}`}
                                title={rowLocked ? t.lockStatusLocked : "Click to edit Foreign guests count"}
                              >
                                {row.foreign || <span className="text-gray-400 font-medium italic">--</span>}
                              </div>
                            )}
                          </td>

                          {/* DISCOUNTED CELL */}
                          <td className="p-2 border-r border-black text-center align-middle font-mono font-bold">
                            {editingCell?.id === row.id && editingCell?.field === "discounted" ? (
                              <input
                                type="text"
                                value={tempValue}
                                autoFocus
                                onBlur={() => handleCellSave(row.id, "discounted")}
                                onKeyDown={(e) => handleKeyDown(e, row.id, "discounted")}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full p-1 text-xs border border-black rounded-none focus:outline-hidden bg-white text-pink-800 text-center font-bold"
                              />
                            ) : (
                              <div
                                onClick={() => handleCellClick(row.id, "discounted", row.discounted || "", dateString)}
                                className={`${editableCellClass} text-center font-bold ${rowLocked ? "text-stone-400" : "text-pink-850"}`}
                                title={rowLocked ? t.lockStatusLocked : "Click to edit Discounted count"}
                              >
                                {row.discounted || <span className="text-gray-400 font-medium italic">--</span>}
                              </div>
                            )}
                          </td>

                          {/* ACTION BUTTON CELL */}
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
