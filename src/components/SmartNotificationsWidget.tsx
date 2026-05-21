import React, { useState } from 'react';
import { Bell, ShieldAlert, Sparkles, Moon, Sun, Play, Check } from 'lucide-react';
import { SmartNotificationSettings, Language } from '../types';

interface SmartNotificationsWidgetProps {
  settings: SmartNotificationSettings;
  setSettings: React.Dispatch<React.SetStateAction<SmartNotificationSettings>>;
  lang: Language;
}

export default function SmartNotificationsWidget({ settings, setSettings, lang }: SmartNotificationsWidgetProps) {
  const isIt = lang === 'it';
  const [showNotificationDemo, setShowNotificationDemo] = useState(false);
  const [demoText, setDemoText] = useState('');

  const t = {
    title: isIt ? "Configurazione Notifiche Smart" : "Smart Alerts Settings",
    desc: isIt ? "Ricevi messaggi contestuali solo quando conta davvero." : "Receive contextual warnings only when it genuinely matters.",
    toggleBriefing: isIt ? "Briefing di Benvenuto Mattutino" : "Morning Atmosphere Briefing",
    descBriefing: isIt ? "Ogni mattina, un riassunto vocale o testuale per iniziare la giornata." : "Every morning, get a summary of what to expect.",
    toggleRain: isIt ? "Allerta Pioggia Imminente" : "Imminent Precipitation Warning",
    descRain: isIt ? "Notifica 45 minuti prima se sta per piove nella tua area." : "Get targeted alerts 45 minutes before local rainfall starts.",
    toggleAir: isIt ? "Allerta Qualità dell'Aria Critica" : "Critical Air Quality Warning",
    descAir: isIt ? "Avviso immediato se l'indice inquinamento (AQI) supera la soglia di rischio." : "Instant message when local AQI triggers poor safety thresholds.",
    toggleTemp: isIt ? "Sbalzo brusco Temperatura" : "Abrupt Temperature Fluctuations",
    descTemp: isIt ? "Ricevi una notifica se le temperature scendono di oltre 5°C." : "Warning triggered on sudden 5°C drops across hours.",
    quietHeader: isIt ? "Fascia d'Ombra Silenziosa (DND)" : "Quiet Hours Config (DND)",
    quietDesc: isIt ? "Nessun avviso verrà inviato in queste ore di silenzio." : "No notifications will be broadcasted inside this slot.",
    testBtn: isIt ? "Esegui Test Allerta Aura" : "Trigger Demo Alert Broadcast",
    testSuccess: isIt ? "Salvato nel dispositivo" : "Saved to device",
  };

  const handleToggle = (key: keyof Omit<SmartNotificationSettings, 'silentStart' | 'silentEnd'>) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTimeChange = (key: 'silentStart' | 'silentEnd', val: string) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  // Trigger beautifully styled alert toaster demo
  const triggerDemoAlert = (type: string) => {
    let msg = "";
    if (isIt) {
      switch(type) {
        case 'briefing': msg = "Buongiorno! A Milano oggi ci sono 15°C e il cielo si schiarirà nel pomeriggio. Prendi una giacca leggera."; break;
        case 'rain': msg = "Aura Alert: Pioggia rilevata in avvicinamento entro 45 minuti. Prendi l'ombrello!"; break;
        case 'airQuality': msg = "Allerta Aria: L'indice inquinamento AQI è oggi a 85 (Scarsa). Limita sport prolungati all'esterno."; break;
        case 'tempChange': msg = "Sbalzo Termico: Le temperature diminuiranno di 6°C nel pomeriggio. Copriti meglio."; break;
        default: msg = "Aura notifiche attive regolarmente.";
      }
    } else {
      switch(type) {
        case 'briefing': msg = "Good morning! Milan is at 15°C and the sky will clear up later today. Grab a light jacket."; break;
        case 'rain': msg = "Aura Alert: Scattered rain showers heading towards your location within 45 mins. Bring an umbrella!"; break;
        case 'airQuality': msg = "Air warning: Local AQI reached 85 (Poor). Avoid strenuous exercise outdoors today."; break;
        case 'tempChange': msg = "Thermal drop: Temperature will decrease by 6°C in the afternoon. Dress warmer."; break;
        default: msg = "Aura automated alerts operating perfectly.";
      }
    }
    setDemoText(msg);
    setShowNotificationDemo(true);
    setTimeout(() => {
      setShowNotificationDemo(false);
    }, 4500);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 select-none relative overflow-visible">
      
      {/* Toast Demo Notification Floating overlay */}
      {showNotificationDemo && (
        <div className="fixed top-6 right-6 md:right-10 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl z-50 max-w-sm animate-fade-in flex items-start space-x-3.5 border-l-4 border-l-indigo-500">
          <div className="shrink-0 bg-indigo-600/35 p-1.5 rounded-xl">
            <Bell className="w-5 h-5 text-indigo-400 animate-bounce" />
          </div>
          <div>
            <div className="flex justify-between items-center text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
              <span>aura smart notification</span>
              <span>• {isIt ? 'ORA' : 'NOW'}</span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed antialiased font-sans select-none">
              {demoText}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-sans uppercase tracking-tight flex items-center">
            <Bell className="w-4 h-4 text-indigo-500 mr-2" />
            {t.title}
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">{t.desc}</p>
        </div>
        <span className="text-[10px] font-mono text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg flex items-center">
          <Check className="w-3.5 h-3.5 mr-1" />
          {t.testSuccess}
        </span>
      </div>

      {/* Grid of Alert Controls */}
      <div className="space-y-4 mb-6">
        {[
          { key: 'briefing' as const, title: t.toggleBriefing, desc: t.descBriefing },
          { key: 'rain' as const, title: t.toggleRain, desc: t.descRain },
          { key: 'airQuality' as const, title: t.toggleAir, desc: t.descAir },
          { key: 'tempChange' as const, title: t.toggleTemp, desc: t.descTemp }
        ].map((item) => {
          const isChecked = settings[item.key];
          return (
            <div 
              key={item.key}
              className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row justify-between items-baseline sm:items-center gap-2 ${
                isChecked 
                  ? 'bg-indigo-50/10 border-indigo-100' 
                  : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-slate-800 font-sans">{item.title}</h4>
                <p className="text-[11px] text-slate-400 font-sans font-light mt-0.5 max-w-lg">{item.desc}</p>
              </div>
              
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => triggerDemoAlert(item.key)}
                  disabled={!isChecked}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-sans font-bold px-2 py-1 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none flex items-center space-x-1"
                  title="Simulate push alert"
                >
                  <Play className="w-2.5 h-2.5" />
                  <span>Test</span>
                </button>

                {/* Switch Input Toggle */}
                <button
                  id={`toggle-alert-${item.key}`}
                  onClick={() => handleToggle(item.key)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                    isChecked ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <div 
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                      isChecked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiet Slot Hour Configuration DND */}
      <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
        <div className="flex items-center space-x-2 mb-2 text-slate-700">
          <Moon className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold font-sans uppercase tracking-wide">{t.quietHeader}</h4>
        </div>
        <p className="text-[11px] text-slate-400 font-sans font-light mb-3">{t.quietDesc}</p>

        <div className="flex items-center space-x-3 text-xs font-sans">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Start:</span>
            <input
              id="quiet-start-input"
              type="time"
              value={settings.silentStart}
              onChange={(e) => handleTimeChange('silentStart', e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="text-slate-300">|</div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">End:</span>
            <input
              id="quiet-end-input"
              type="time"
              value={settings.silentEnd}
              onChange={(e) => handleTimeChange('silentEnd', e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
