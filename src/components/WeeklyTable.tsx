import React from 'react';
import { Calendar, Eye, CloudDrizzle, Sun, CloudRain, Cloud, CloudSnow, SunDim, ThermometerSun } from 'lucide-react';
import { WeatherData, WeatherDailySlot, Language } from '../types';

interface WeeklyTableProps {
  weather: WeatherData;
  lang: Language;
  onSelectDay: (day: WeatherDailySlot) => void;
}

export default function WeeklyTable({ weather, lang, onSelectDay }: WeeklyTableProps) {
  const isIt = lang === 'it';
  const { daily } = weather;

  const t = {
    tableTitle: isIt ? 'Analisi Settimanale' : '7-Day Forecast Analysis',
    colDay: isIt ? 'Giorno' : 'Day',
    colRain: isIt ? 'Precipitazioni' : 'Precipitation',
    colWindRating: isIt ? 'Brezza' : 'Wind rating',
    colTemp: isIt ? 'Escursione' : 'Temperatures',
    colOutfit: isIt ? 'Status / Outfit' : 'Status / Outfit',
    detailsAction: isIt ? 'Dettaglio' : 'Details'
  };

  // Maps WMO code to weather icon for the table rows
  const renderWeatherIcon = (code: number) => {
    if ([0, 1].includes(code)) {
      return <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />;
    } else if ([2, 3].includes(code)) {
      return <Cloud className="w-5 h-5 text-white/60" />;
    } else if ([51, 53, 55, 56, 57].includes(code)) {
      return <CloudDrizzle className="w-5 h-5 text-indigo-300" />;
    } else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      return <CloudRain className="w-5 h-5 text-blue-400" />;
    } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return <CloudSnow className="w-5 h-5 text-sky-200" />;
    }
    return <SunDim className="w-5 h-5 text-amber-400" />;
  };

  // Choose styling based on the temperature/rain status of the day, matching Paid/Unpaid pills from screenshot
  const resolveStatusPill = (tempMax: number, rainProb: number) => {
    if (rainProb >= 50) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono uppercase tracking-wide">
          {isIt ? 'Ombrello' : 'Umbrella / Wet'}
        </span>
      );
    }
    if (tempMax >= 26) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono uppercase tracking-wide">
          {isIt ? 'Molto Caldo' : 'Hot / T-Shirt'}
        </span>
      );
    }
    if (tempMax < 13) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20 font-mono uppercase tracking-wide">
          {isIt ? 'Cappotto' : 'Puffer Jacket'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-mono uppercase tracking-wide">
        {isIt ? 'A Strati' : 'Layers / Mild'}
      </span>
    );
  };

  // Convert date format from 2026-05-21 to 21/05/26 to exactly mimic screenshot style "23/02/23"
  const formatDateToSnippet = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0].substring(2)}`;
      }
    } catch (e) {}
    return dateStr;
  };

  return (
    <div className="bg-white/[0.03] rounded-[2rem] p-6 border border-white/10 shadow-none select-none">
      
      {/* Table Header Row */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-bold text-white font-sans tracking-tight uppercase">
          {t.tableTitle}
        </h3>
        <span className="text-[10px] font-mono text-white/80 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
          {isIt ? 'PREVISIONI 7 GIORNI' : '7D DAILY OUTLOOK'}
        </span>
      </div>

      {/* Styled Grid/Table strictly copying the spacing and alignments in the screenshot */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans">
          <thead>
            <tr className="border-b border-white/10 text-[11px] text-white/50 uppercase font-mono tracking-wider font-semibold">
              <th className="py-3 px-1">{t.colDay}</th>
              <th className="py-3 px-1">{t.colRain}</th>
              <th className="py-3 px-1">{t.colWindRating}</th>
              <th className="py-3 px-1">{t.colTemp}</th>
              <th className="py-3 px-1 text-center">{t.colOutfit}</th>
              <th className="py-3 px-1 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {daily.map((item, index) => (
              <tr 
                key={index}
                onClick={() => onSelectDay(item)}
                className="hover:bg-white/[0.04] group transition duration-150 cursor-pointer"
              >
                {/* Date / Day Name column value */}
                <td className="py-4 px-1 flex items-center space-x-2.5">
                  <div className="shrink-0">
                    {renderWeatherIcon(item.dominantConditionCode)}
                  </div>
                  <div>
                    <span className="font-semibold text-white capitalize font-sans block">
                      {item.dayName}
                    </span>
                    <span className="text-[10px] text-white/40 font-mono block mt-0.5">
                      {formatDateToSnippet(item.date)}
                    </span>
                  </div>
                </td>

                {/* Rain probability bar representation matching table cell statistics */}
                <td className="py-4 px-1 min-w-[120px]">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-white/80 font-bold">{item.rainProb}%</span>
                    <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.rainProb > 40 ? 'bg-white' : 'bg-white/30'}`}
                        style={{ width: `${item.rainProb}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Wind/Vento category value */}
                <td className="py-4 px-1 text-white/60 font-mono">
                  {item.rainProb > 40 ? (isIt ? "Rischio Pioggia" : "Rain risk") : (isIt ? "Brezza Leggera" : "Gentle breeze")}
                </td>

                {/* Min/Max Temperature column matching total kWh column */}
                <td className="py-4 px-1">
                  <span className="font-display font-bold text-white text-sm">
                    {item.tempMax}° / <span className="text-white/40">{item.tempMin}°</span>
                  </span>
                </td>

                {/* Visual Custom recommendation Status Pill mirroring paid/unpaid elements */}
                <td className="py-4 px-1 text-center">
                  {resolveStatusPill(item.tempMax, item.rainProb)}
                </td>

                {/* Action button in the right boundary matching edit pencils */}
                <td className="py-4 px-1 text-right">
                  <button 
                    id={`view-day-btn-${index}`}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-150"
                    title={t.detailsAction}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>);
}
