import React from 'react';
import { Thermometer, Wind, Eye, Droplets, Sun, Activity } from 'lucide-react';
import { WeatherData, Language } from '../types';

interface MetricCardsProps {
  weather: WeatherData;
  lang: Language;
}

export default function MetricCards({ weather, lang }: MetricCardsProps) {
  const isIt = lang === 'it';
  const { current } = weather;

  // Render Delta Pill matching the black bold style perfectly!
  const renderDeltaPill = () => {
    const delta = current.prevDayTempDelta;
    if (delta > 0) {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
          {isIt ? `↑ +${delta}°C da ieri` : `↑ +${delta}°C vs yesterday`}
        </span>
      );
    } else if (delta < 0) {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
          {isIt ? `↓ ${delta}°C da ieri` : `↓ ${delta}°C vs yesterday`}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-white/60 border border-white/10 font-mono">
          {isIt ? `• Stessa temp.` : `• Same as yesterday`}
        </span>
      );
    }
  };

  // Render Wind Pill
  const renderWindPill = () => {
    const speed = current.windSpeed;
    if (speed >= 25) {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono animate-pulse">
          {isIt ? `↑ Forte: ${speed} km/h` : `↑ Gale: ${speed} km/h`}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
          {isIt ? `↓ Brezza: ${speed} km/h` : `↓ Gentle: ${speed} km/h`}
        </span>
      );
    }
  };

  // Render UV Pill
  const renderUVPill = () => {
    const uv = current.uvIndex;
    if (uv >= 6) {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 font-mono">
          {isIt ? `↑ Alto: SPF 30+` : `↑ High: SPF 30+`}
        </span>
      );
    } else if (uv >= 3) {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
          {isIt ? `↓ Medio: SPF 15` : `↓ Moderate: SPF 15`}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
          {isIt ? `↓ Basso: sicuro` : `↓ Low: safe`}
        </span>
      );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 select-none">
      
      {/* 1. Temp Card */}
      <div className="bg-white/[0.03] hover:bg-white/[0.08] rounded-[1.8rem] p-6 border border-white/10 transition-all duration-300 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs uppercase tracking-widest text-white/40 font-mono font-bold mb-1 block">
              {isIt ? "Temperatura" : "Temperature"}
            </span>
            <h5 className="text-[10px] font-mono font-semibold text-white/50 uppercase mt-0.5">
              {isIt ? "Percepiti" : "Feels like"} {current.feelsLike}°C
            </h5>
          </div>
          <Thermometer className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="my-5">
          <span className="text-5xl md:text-6xl font-black font-display text-white tracking-tighter">
            {current.temp}
          </span>
          <span className="text-2xl font-display font-light text-white/40 ml-1">°</span>
        </div>
        <div className="mt-1">
          {renderDeltaPill()}
        </div>
      </div>

      {/* 2. Humidity & Atmosphere Card */}
      <div className="bg-white/[0.03] hover:bg-white/[0.08] rounded-[1.8rem] p-6 border border-white/10 transition-all duration-300 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs uppercase tracking-widest text-white/40 font-mono font-bold mb-1 block">
              {isIt ? "Umidità Relativa" : "Relative Humidity"}
            </span>
            <h5 className="text-[10px] font-mono font-semibold text-indigo-300 uppercase mt-0.5">
              {current.conditionText}
            </h5>
          </div>
          <Droplets className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="my-5">
          <span className="text-5xl md:text-6xl font-black font-display text-white tracking-tighter">
            {current.humidity}
          </span>
          <span className="text-2xl font-display font-light text-white/40 ml-1">%</span>
        </div>
        <div className="mt-1">
          {renderWindPill()}
        </div>
      </div>

      {/* 3. UV Card */}
      <div className="bg-white/[0.03] hover:bg-white/[0.08] rounded-[1.8rem] p-6 border border-white/10 transition-all duration-300 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs uppercase tracking-widest text-white/40 font-mono font-bold mb-1 block">
              {isIt ? "Indice UV" : "UV Index"}
            </span>
            <h5 className="text-[10px] font-mono font-semibold text-white/50 uppercase mt-0.5">
              {isIt ? `${current.uvText} Raggi` : `${current.uvText} Rays`}
            </h5>
          </div>
          <Sun className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="my-5">
          <span className="text-5xl md:text-6xl font-black font-display text-white tracking-tighter">
            {Math.round(current.uvIndex * 10) / 10}
          </span>
          <span className="text-2xl font-display font-light text-white/40 ml-1">UV</span>
        </div>
        <div className="mt-1">
          {renderUVPill()}
        </div>
      </div>

    </div>
  );
}
