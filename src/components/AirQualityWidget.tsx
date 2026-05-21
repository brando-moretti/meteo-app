import React from 'react';
import { Wind, Activity, Heart, ShieldAlert, CheckCircle } from 'lucide-react';
import { WeatherData, Language } from '../types';

interface AirQualityWidgetProps {
  weather: WeatherData;
  lang: Language;
}

export default function AirQualityWidget({ weather, lang }: AirQualityWidgetProps) {
  const isIt = lang === 'it';
  const aqi = weather.airQuality;

  const t = {
    aqiTitle: isIt ? "Analisi Qualità dell'Aria" : "Air Quality Index Breakdown",
    aqiDesc: isIt ? "Rilevazione emissioni e inquinanti attuali" : "Current ambient pollutant levels",
    ratingLabel: isIt ? "Classificazione" : "Classification",
    pollutantsTitle: isIt ? "Concentrazione Inquinanti" : "Pollutant Concentrations",
    statusText: isIt ? "Consiglio Salute" : "Health Advisory",
    excellent: isIt ? "Eccellente / Ottima" : "Excellent",
    good: isIt ? "Buona" : "Good",
    fair: isIt ? "Discreta" : "Fair",
    poor: isIt ? "Scarsa" : "Poor",
    veryPoor: isIt ? "Pessima / Pericolosa" : "Very Poor",
  };

  // Convert european AQI (usually 1 to 100+) to a percentage classification
  const getProgressColor = (score: number) => {
    if (score <= 25) return 'bg-emerald-500';
    if (score <= 50) return 'bg-green-500';
    if (score <= 75) return 'bg-amber-400';
    if (score <= 100) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  const aqiRatingText = isIt ? aqi.rating : aqi.ratingEn;
  const healthAdvText = isIt ? aqi.recommendation : aqi.recommendationEn;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 select-none">
      
      {/* Title */}
      <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-sans uppercase tracking-tight flex items-center">
            <Wind className="w-4 h-4 text-indigo-500 mr-2" />
            {t.aqiTitle}
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">{t.aqiDesc}</p>
        </div>
        <div className="flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-xs font-mono font-bold">AQI {aqi.aqi}</span>
        </div>
      </div>

      {/* AQI Indicator Slider bar */}
      <div className="mb-6">
        <div className="flex justify-between text-[11px] font-semibold font-mono text-slate-400 mb-2">
          <span>0 (Ottima)</span>
          <span>50 (Buona)</span>
          <span>75 (Discreta)</span>
          <span>100+ (Critica)</span>
        </div>
        <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
          <div 
            className={`h-full rounded-full ${getProgressColor(aqi.aqi)} transition-all duration-500`}
            style={{ width: `${Math.min(100, (aqi.aqi / 120) * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200">
          <span className="text-slate-500 font-sans">{t.ratingLabel}:</span>
          <span className={`font-bold ${
            aqi.aqi <= 25 ? 'text-emerald-600' : 
            aqi.aqi <= 50 ? 'text-green-600' : 
            aqi.aqi <= 75 ? 'text-amber-600' : 
            aqi.aqi <= 100 ? 'text-orange-600' : 'text-rose-600'
          }`}>
            {aqiRatingText}
          </span>
        </div>
      </div>

      {/* Heatlh suggestion message widget with icon */}
      <div className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 hover:from-indigo-500/10 hover:to-purple-500/10 border border-indigo-100/40 rounded-2xl p-4 mb-6 flex items-start space-x-3 transition-all duration-200">
        <Heart className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-800 font-sans">{t.statusText}</h4>
          <p className="text-xs text-slate-600 font-sans font-light italic mt-1 leading-relaxed">
            "{healthAdvText}"
          </p>
        </div>
      </div>

      {/* Main Pollutants Grid */}
      <div>
        <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">
          {t.pollutantsTitle}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'PM2.5', value: aqi.pm25, unit: 'µg/m³', desc: isIt ? 'Particolato Fine' : 'Fine Particles' },
            { label: 'PM10', value: aqi.pm10, unit: 'µg/m³', desc: isIt ? 'Monossido Sol. Part.' : 'Inhalable Dust' },
            { label: 'NO₂', value: aqi.no2, unit: 'µg/m³', desc: isIt ? 'Biossido d\'Azoto' : 'Nitrogen Dioxide' },
            { label: 'O₃', value: aqi.o3, unit: 'µg/m³', desc: isIt ? 'Ozono' : 'Ozone' },
            { label: 'SO₂', value: aqi.so2, unit: 'µg/m³', desc: isIt ? 'Biossido di Zolfo' : 'Sulfur Dioxide' },
            { label: 'CO', value: aqi.co, unit: 'mg/m³', desc: isIt ? 'Monossido di Carbonio' : 'Carbon Monoxide' }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-all shadow-xs"
            >
              <div className="flex justify-between items-center text-[10px] font-semibold font-mono text-slate-400">
                <span>{item.label}</span>
                <span className="text-[9px] uppercase font-light">{item.unit}</span>
              </div>
              <div className="my-1.5 text-base font-bold font-mono text-slate-800">
                {item.value}
              </div>
              <div className="text-[9px] text-slate-400 font-sans truncate">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
