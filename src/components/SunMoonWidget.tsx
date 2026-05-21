import React from 'react';
import { Sun, Sunset, Sunrise, Moon, MoonStar, Eye } from 'lucide-react';
import { WeatherData, Language } from '../types';

interface SunMoonWidgetProps {
  weather: WeatherData;
  lang: Language;
}

export default function SunMoonWidget({ weather, lang }: SunMoonWidgetProps) {
  const isIt = lang === 'it';
  const { sunMoon } = weather;

  const t = {
    sunTitle: isIt ? "Arco Solare & Durata Giorno" : "Solar Arc & Day length",
    sunDesc: isIt ? "Progressivo luce e tramonto" : "Daylight pathway details",
    moonTitle: isIt ? "Fase Lunare Attuale" : "Current Moon Phase",
    sunrise: isIt ? "Alba" : "Sunrise",
    sunset: isIt ? "Tramonto" : "Sunset",
    dayLength: isIt ? "Durata totale" : "Total day length",
    remaining: isIt ? "Ore di luce" : "Daylight remaining",
    remainingLabel: isIt ? "Status sole" : "Sun status",
    moonPhasePercent: isIt ? "Illuminazione lunare" : "Lunar illumination",
  };

  // Visual Golden Sun Arc progress calculation
  // Let's compute standard progress of current time between sunrise (e.g. 05:30) and sunset (e.g. 21:00)
  // Let's make an automated mock calculation to place the golden sun dot nicely on our curve!
  const getSunProgress = () => {
    try {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      
      const [srH, srM] = sunMoon.sunrise.split(':').map(Number);
      const [ssH, ssM] = sunMoon.sunset.split(':').map(Number);
      
      const sunriseMin = srH * 60 + srM;
      const sunsetMin = ssH * 60 + ssM;
      
      if (currentMin < sunriseMin) return 0; // before sunrise
      if (currentMin > sunsetMin) return 1; // after sunset
      
      return (currentMin - sunriseMin) / (sunsetMin - sunriseMin);
    } catch (e) {
      return 0.45; // default center position
    }
  };

  const sunProgress = getSunProgress();

  // Position of golden sun ball along an SVG semi-circle path
  const arcX = 50 + sunProgress * 200; // SVG viewBox coordinates
  const arcY = 120 - Math.sin(sunProgress * Math.PI) * 70; // Peak at y=50

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 select-none">
      
      {/* Title */}
      <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-sans uppercase tracking-tight flex items-center">
            <Sun className="w-4 h-4 text-indigo-500 mr-2" />
            {t.sunTitle}
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">{t.sunDesc}</p>
        </div>
        <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-xl">
          <Sunrise className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono font-bold uppercase">{sunMoon.sunrise}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* Sun Trajectory Arc Column */}
        <div className="relative flex flex-col items-center">
          <svg viewBox="0 0 300 130" className="w-full max-w-[280px] overflow-visible">
            {/* Semicircular trajectory guidelines */}
            <path 
              d="M 50 120 A 100 100 0 0 1 250 120" 
              fill="none" 
              stroke="#e2e8f0" 
              strokeWidth="2.5" 
              strokeDasharray="4 4" 
            />
            
            {/* Pathway progress shadow line */}
            <path 
              d={`M 50 120 A 100 100 0 0 1 ${arcX} ${arcY}`} 
              fill="none" 
              stroke="url(#sun-gradient)" 
              strokeWidth="3.5" 
              strokeLinecap="round"
            />
            
            {/* Sunrise / Sunset Base line */}
            <line x1="20" y1="120" x2="280" y2="120" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* Sunrise text label */}
            <text x="50" y="132" textAnchor="middle" className="fill-slate-400 text-[10px] font-mono font-semibold">{t.sunrise}</text>
            {/* Sunset text label */}
            <text x="250" y="132" textAnchor="middle" className="fill-slate-400 text-[10px] font-mono font-semibold">{t.sunset}</text>

            {/* Glowing Golden Sun Ball dot representing current progress */}
            <g>
              <defs>
                <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="sun-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
              <circle cx={arcX} cy={arcY} r="18" fill="url(#sun-glow)" />
              <circle cx={arcX} cy={arcY} r="7" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
            </g>
          </svg>

          {/* Sun statistics list */}
          <div className="w-full mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-sans uppercase block">{t.dayLength}</span>
              <span className="text-sm font-semibold font-display text-slate-800 mt-1 block">{sunMoon.dayLength}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-sans uppercase block">{t.remainingLabel}</span>
              <span className="text-sm font-semibold font-display text-slate-800 mt-1 block truncate">
                {sunMoon.daylightRemaining}
              </span>
            </div>
          </div>
        </div>

        {/* Moon Phase Column with customized visual representation */}
        <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6 flex flex-col justify-center">
          <div className="flex items-center space-x-2.5 mb-3">
            <MoonStar className="w-4 h-4 text-indigo-500" />
            <h4 className="text-xs font-bold text-slate-900 font-sans uppercase tracking-wider">{t.moonTitle}</h4>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center space-x-4">
            {/* Visual moon representation depending on current phase */}
            <div className="relative shrink-0 w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800/80 shadow-inner overflow-hidden">
              {/* Moon craters details */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_30%_30%,_transparent_50%,_rgba(255,255,255,0.4)_80%)]" />
              <div className="absolute w-3 h-3 rounded-full bg-slate-800 top-2.5 left-4 opacity-30 shadow-inner" />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-slate-800 bottom-3.5 right-4 opacity-40 shadow-inner" />
              <div className="absolute w-4 h-4 rounded-full bg-slate-800 bottom-5 left-3 opacity-25 shadow-inner" />

              {/* Dynamic shining shadow indicating percentage */}
              <div 
                className="absolute right-0 h-16 bg-amber-50/90 mix-blend-color-dodge transition-all duration-150"
                style={{ 
                  width: `${(1 - Math.abs(0.5 - sunMoon.moonPhase) * 2) * 100}%`,
                  borderRadius: '0 500px 500px 0',
                  opacity: sunMoon.moonPhase > 0.05 && sunMoon.moonPhase < 0.95 ? 0.9 : 0
                }}
              />
              {/* Special moon graphic centered */}
              <Moon className="w-9 h-9 text-amber-100 relative z-10" />
            </div>

            {/* Moon texts */}
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-mono text-indigo-600 font-bold block">
                {isIt ? sunMoon.moonPhaseText : sunMoon.moonPhaseTextEn}
              </span>
              <span className="text-[10px] text-slate-400 font-sans block mt-1">
                {t.moonPhasePercent}: <span className="font-semibold text-slate-600">{Math.round((1 - Math.abs(0.5 - sunMoon.moonPhase) * 2) * 100)}%</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 block mt-1 italic">
                {isIt ? 'Ciclo Lunare: ' : 'Lunar Cycle: '} {sunMoon.moonPhase}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
