import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  MapPin, 
  Search, 
  Sparkles, 
  Bell, 
  Activity, 
  Languages, 
  Navigation, 
  HelpCircle, 
  RefreshCw, 
  Trash2, 
  UserCircle2, 
  Webhook, 
  Shirt,
  Calendar,
  AlertCircle
} from 'lucide-react';

import { 
  Language, 
  UserProfile, 
  CityData, 
  WeatherData, 
  SmartNotificationSettings, 
  N8NConfig 
} from './types';

import Sidebar from './components/Sidebar';
import MetricCards from './components/MetricCards';
import WeatherChart from './components/WeatherChart';
import WeeklyTable from './components/WeeklyTable';
import AirQualityWidget from './components/AirQualityWidget';
import SunMoonWidget from './components/SunMoonWidget';
import SmartNotificationsWidget from './components/SmartNotificationsWidget';
import N8NConfigWidget from './components/N8NConfigWidget';

// Initial local storage defaults or standard items
const DEFAULT_SAVED_PLACES: CityData[] = [
  { name: "Milano", country: "Italia", countryCode: "IT", lat: 45.4642, lon: 9.1900 },
  { name: "Roma", country: "Italia", countryCode: "IT", lat: 41.8919, lon: 12.5113 },
  { name: "Venezia", country: "Italia", countryCode: "IT", lat: 45.4371, lon: 12.3326 },
  { name: "Firenze", country: "Italia", countryCode: "IT", lat: 43.7696, lon: 11.2558 }
];

export default function App() {
  // Navigation & Preferences active state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [lang, setLang] = useState<Language>('it');
  
  // Rehydrate profile setting
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('aura_user_profile');
    return (saved as UserProfile) || 'freddoloso';
  });

  // Rehydrate saved places
  const [savedCities, setSavedCities] = useState<CityData[]>(() => {
    const saved = localStorage.getItem('aura_saved_cities');
    return saved ? JSON.parse(saved) : DEFAULT_SAVED_PLACES;
  });

  // Rehydrate active selected city
  const [selectedCity, setSelectedCity] = useState<CityData>(() => {
    const saved = localStorage.getItem('aura_selected_city');
    return saved ? JSON.parse(saved) : DEFAULT_SAVED_PLACES[0];
  });

  // States for weather and requests loading state
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);

  // Clothing suggestion states
  const [clothingSuggestion, setClothingSuggestion] = useState<string>('');
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState<boolean>(false);

  // Smart notification setups
  const [smartSettings, setSmartSettings] = useState<SmartNotificationSettings>(() => {
    const saved = localStorage.getItem('aura_smart_settings');
    return saved ? JSON.parse(saved) : {
      briefing: true,
      rain: true,
      tempChange: true,
      airQuality: false,
      silentStart: '22:00',
      silentEnd: '07:00'
    };
  });

  // n8n connection values
  const [n8nConfig, setN8nConfig] = useState<N8NConfig>(() => {
    const saved = localStorage.getItem('aura_n8n_config');
    return saved ? JSON.parse(saved) : {
      webhookUrl: '',
      enabled: false
    };
  });

  // Keep LocalStorage synced
  useEffect(() => {
    localStorage.setItem('aura_user_profile', profile);
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('aura_saved_cities', JSON.stringify(savedCities));
  }, [savedCities]);

  useEffect(() => {
    localStorage.setItem('aura_selected_city', JSON.stringify(selectedCity));
  }, [selectedCity]);

  useEffect(() => {
    localStorage.setItem('aura_smart_settings', JSON.stringify(smartSettings));
  }, [smartSettings]);

  useEffect(() => {
    localStorage.setItem('aura_n8n_config', JSON.stringify(n8nConfig));
  }, [n8nConfig]);

  // Main Weather Loader function
  const fetchWeather = async (city: CityData, quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);
    setErrorText(null);

    try {
      // Build pipeline URL query parameters
      let url = `/api/weather?lat=${city.lat}&lon=${city.lon}&name=${encodeURIComponent(city.name)}`;
      if (n8nConfig.enabled && n8nConfig.webhookUrl) {
        url += `&webhook=${encodeURIComponent(n8nConfig.webhookUrl)}&n8nEnabled=true`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(lang === 'it' ? "Impossibile scaricare bollettino meteo." : "Could not retrieve weather bulletin.");
      }
      
      const payload: WeatherData = await res.json();
      setWeather(payload);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Failed to load weather");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch weather on selected city change or n8n state change
  useEffect(() => {
    if (selectedCity) {
      fetchWeather(selectedCity);
    }
  }, [selectedCity, n8nConfig.enabled]);

  // Generate tailoring suggestions from Gemini
  const generateClothingSuggestion = async () => {
    if (!weather) return;
    setIsGeneratingSuggestion(true);
    try {
      const res = await fetch('/api/clothing-suggestion', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weather: weather,
          profile: profile,
          lang: lang
        })
      });
      if (res.ok) {
        const body = await res.json();
        setClothingSuggestion(body.suggestion);
      } else {
        throw new Error();
      }
    } catch (e) {
      console.error("Failed to generate custom suggestions:", e);
      // Fallback fallback suggestions are processed elegantly in backend routes directly
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  // Automatically recalculate styling garment advice if weather or profile toggled
  useEffect(() => {
    if (weather) {
      generateClothingSuggestion();
    }
  }, [weather, profile, lang]);

  // Save cities management handlers
  const handleAddCity = (city: CityData) => {
    if (!savedCities.some(c => c.name.toLowerCase() === city.name.toLowerCase())) {
      const updated = [city, ...savedCities.slice(0, 4)]; // max 5 cities
      setSavedCities(updated);
    }
  };

  const handleRemoveCity = (city: CityData) => {
    const updated = savedCities.filter(c => c.name.toLowerCase() !== city.name.toLowerCase());
    setSavedCities(updated);
  };

  // Locate user coordinates using GPS locator
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setErrorText(lang === 'it' ? "La geolocalizzazione non è supportata dal browser." : "GPS geolocation is not supported in your browser.");
      return;
    }
    setIsGpsLoading(true);
    setErrorText(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        
        let locatedName = lang === 'it' ? "Tua Posizione" : "Your Location";
        
        // Reverse geocoding via Nominatim safely
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const geocode = await res.json();
            locatedName = geocode.address.city || geocode.address.town || geocode.address.village || geocode.address.suburb || locatedName;
          }
        } catch (e) {
          console.warn("Could not reverse geocode coordinates, falling back to local description:", e);
        }

        const cityObj: CityData = {
          name: locatedName,
          country: lang === 'it' ? "Italia" : "Italy",
          lat: lat,
          lon: lon
        };
        
        setSelectedCity(cityObj);
        handleAddCity(cityObj);
        setIsGpsLoading(false);
      },
      (err) => {
        console.error(err);
        setErrorText(lang === 'it' 
          ? "Non riusciamo a rilevare la tua posizione. Seleziona manualmente." 
          : "Could not retrieve your position. Please select manual coordinates.");
        setIsGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  // Manual Trigger Refresh
  const handleRefresh = () => {
    if (selectedCity) {
      fetchWeather(selectedCity, true);
    }
  };

  // Multi-language copy text mappings
  const t = {
    heroTitle: lang === 'it' ? "Il meteo che ti parla." : "The weather that talks.",
    heroSub: lang === 'it' ? "Non quello che ti confonde." : "Not the one that confuses you.",
    hookTitle: lang === 'it' ? "Fuori piove. Tu lo sapevi già." : "It's raining outside. You already knew.",
    hookDesc: lang === 'it' ? "Temperatura reale, qualità dell'aria, vento, UV e livello umidità. Affronta la giornata al volo." : "Feels-like temp, air index, UV ratings and detailed conditions. Start your mornings right.",
    onboardingTitle: lang === 'it' ? "Da dove vuoi iniziare la tua giornata?" : "Where do you want to start your day?",
    onboardingDesc: lang === 'it' 
      ? "Inserisci la tua città o lascia che Aura la rilevi automaticamente. Puoi aggiungerne altre in qualsiasi momento."
      : "Insert a city or allow Aura to locate your current position automatically. Bookmarks can be altered later.",
    onboardingGPSBtn: lang === 'it' ? "Usa la mia posizione" : "Determine My Position",
    onboardingManualPlaceholder: lang === 'it' ? "Milano, Roma, Palermo..." : "New York, London, Venice...",
    onboardingMicro: lang === 'it' ? "Usiamo la tua posizione solo per mostrarti il meteo. Nient'altro." : "We utilize coordinates exclusively for meteorological queries. No persistence.",
    clothingTitle: lang === 'it' ? "Abiti Raccomandati · Astra AI" : "Tailored Outfit Advice · Astra AI",
    clothingIntro: lang === 'it' 
      ? "Sulla base del meteo attuale e il tuo profilo abitudini, Astra suggerisce:"
      : "Based on real-time atmospheric conditions and your active routine profile, Astra states:",
    coatRecom: lang === 'it' ? "Guardaroba consigliato" : "Recommended items",
    coatBe: lang === 'it' ? "In base alla temperatura, ricorda:" : "Considering temperature constraints:",
    alertTitle: lang === 'it' ? "Buongiorno" : "Good morning",
    alertCopy: lang === 'it' 
      ? `A ${selectedCity.name} oggi ci sono ${weather?.current.temp || 15}°C e il cielo si presenta ${weather?.current.conditionText || 'variabile'}.`
      : `Milan is currently at ${weather?.current.temp || 15}°C and the skies look ${weather?.current.conditionText || 'cloudy'}.`,
    alertAction: lang === 'it' ? "Vestiti a strati!" : "Dress in layers and enjoy!",
    emptyTitle: lang === 'it' ? "Nessuna città inserita" : "No active location",
    emptyDesc: lang === 'it' ? "Inserisci una città a sinistra per caricare la giornata." : "Enter a city on the left sidebar to render its daily outlook.",
    hourlyTitle: lang === 'it' ? "Tempo di Oggi" : "Daylight Timeline",
    loadingText: lang === 'it' ? "Leggendo l'atmosfera..." : "Reading the atmosphere...",
  };

  // Render main screen component depending on tab chosen
  const renderTabContent = () => {
    if (!weather) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 font-sans px-6">
          <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
          <h4 className="text-base font-semibold text-slate-800">{t.emptyTitle}</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">{t.emptyDesc}</p>
        </div>
      );
    }

    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Contextual Human Message */}
            <div className="p-6 md:p-8 bg-white/[0.03] border border-white/10 rounded-[2rem] select-none my-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 block mb-3 font-mono">
                {lang === 'it' ? 'Aura • L\'Occhiata del Giorno' : 'Aura • Daily Briefing'}
              </span>
              <p className="text-xl sm:text-2xl font-serif italic text-white/95 leading-relaxed">
                "{lang === 'it'
                  ? `L'ombrello? ${[51,53,55,61,63,65,80,81,82,95,96,99].includes(weather.current.conditionCode) ? 'Sì, tienilo a portata di mano oggi.' : 'Oggi puoi lasciarlo a casa senza pensieri!'} A ${weather.city.name} abbiamo ${weather.current.temp}°C con cieli ${weather.current.conditionText.toLowerCase()}.`
                  : `An umbrella? ${[51,53,55,61,63,65,80,81,82,95,96,99].includes(weather.current.conditionCode) ? 'Yes, keep it close by today.' : 'No need for it today!'} Currently at ${weather.current.temp}°C in ${weather.city.name} with ${weather.current.conditionText.toLowerCase()} skies.`}"
              </p>
            </div>

            {/* Stat Cards Row */}
            <MetricCards weather={weather} lang={lang} />

            {/* Curving interactive main graph */}
            <WeatherChart weather={weather} lang={lang} />

            {/* Weekly calendar Table */}
            <WeeklyTable 
              weather={weather} 
              lang={lang} 
              onSelectDay={(daySlot) => {
                // If a day is tapped, we could change selected city or detail, 
                // in our UX we show a smart micro-advise
                alert(`${lang === 'it' ? 'Giorno:' : 'Day:'} ${daySlot.dayName} (${daySlot.date}) - Temp: ${daySlot.tempMax}°/${daySlot.tempMin}°`);
              }} 
            />
          </div>
        );

      case 'clothing':
        return (
          <div className="space-y-6 select-none animate-fade-in">
            {/* Elegant Large Clothing details Panel with Astra icon */}
            <div className="bg-gradient-to-br from-[#101223] to-[#06070d] text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row gap-6 items-center">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
                  <Shirt className="w-12 h-12 text-indigo-400 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md">
                  <Sparkles className="w-4 h-4 fill-current outline-none" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest">{t.clothingTitle}</span>
                <h3 className="text-lg font-bold text-white font-sans mt-1">{t.clothingIntro}</h3>
                
                <p className="text-sm font-sans text-slate-300 font-light italic leading-relaxed mt-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 max-w-2xl select-text">
                  "{clothingSuggestion || (lang === 'it' ? 'Elaborando consigli su vestiti...' : 'Creating suggestions...')}"
                </p>
              </div>
            </div>

            {/* Interactive Dressing Room Layout visual */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-sans mb-4">
                {t.coatRecom} ({lang === 'it' ? 'Stagionale' : 'Seasonal'})
              </h4>
              <p className="text-xs text-slate-400 font-sans mb-5">{t.coatBe}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { item: lang === 'it' ? 'Giacca' : 'Jacket style', rule: weather.current.temp < 14 ? (lang === 'it' ? 'Cappotto o giacca imbottita' : 'Heavy coat suggested') : (lang === 'it' ? 'Spolverino o blazer' : 'Light jacket/Blazer') },
                  { item: lang === 'it' ? 'Scarpe' : 'Footwear', rule: [51,53,55,61,63,65,80,81,82,95,96,99].includes(weather.current.conditionCode) ? (lang === 'it' ? 'Impermeabili o stivali' : 'Waterproof or boots') : (lang === 'it' ? 'Sneakers traspiranti' : 'Comfortable sneakers') },
                  { item: lang === 'it' ? 'Accessori' : 'Accoutrements', rule: weather.current.uvIndex >= 4 ? (lang === 'it' ? 'Occhiali da sole + crema' : 'Sunglasses & SPF protection') : (lang === 'it' ? 'Ombrello compatto in borsa' : 'Keep umbrella ready') },
                  { item: lang === 'it' ? 'Livelli d\'Aria' : 'Exertion', rule: weather.airQuality.aqi > 75 ? (lang === 'it' ? 'Evita allenamento esterno' : 'Limit outdoor exercise') : (lang === 'it' ? 'Ottimo per corsa esterna' : 'Safe for hiking/sports') },
                ].map((cell, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between hover:bg-slate-100 transition-all text-center">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">{cell.item}</span>
                    <span className="text-xs font-bold text-slate-800 mt-2 font-sans">{cell.rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'aqi':
        return <AirQualityWidget weather={weather} lang={lang} />;

      case 'sunmoon':
        return <SunMoonWidget weather={weather} lang={lang} />;

      case 'notifications':
        return (
          <SmartNotificationsWidget 
            settings={smartSettings} 
            setSettings={setSmartSettings} 
            lang={lang} 
          />
        );

      case 'n8n':
        return (
          <N8NConfigWidget 
            config={n8nConfig} 
            setConfig={setN8nConfig} 
            lang={lang} 
          />
        );

      default:
        return null;
    }
  };

  // Onboarding Layout frame (if city selection hasn't completed or is loading)
  if (loading && !weather) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-indigo-950 select-none">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <CloudSun className="w-9 h-9 text-indigo-400 animate-spin-slow" />
          </div>
          <p className="text-sm font-sans font-light text-slate-300 tracking-wider animate-bounce">
            {t.loadingText}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center p-3 md:p-6 font-sans antialiased bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-[#0A0A0C] via-[#050506] to-[#0d0a1b] shrink-0 text-white">
      
      {/* Absolute wrapper constraints matching premium presentation screenshot */}
      <div className="max-w-7xl w-full bg-[#0A0A0B] text-white rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden border border-white/10 flex flex-col md:flex-row min-h-[780px] select-none">
        
        {/* Sidebar Left Console Column */}
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
          setLang={setLang}
          profile={profile}
          setProfile={setProfile}
          weather={weather}
          savedCities={savedCities}
          onSelectCity={setSelectedCity}
          onAddCity={handleAddCity}
          onRemoveCity={handleRemoveCity}
          onUseGPS={handleUseGPS}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          clothingSuggestion={clothingSuggestion}
          isGeneratingSuggestion={isGeneratingSuggestion}
          onGenerateSuggestion={generateClothingSuggestion}
          isGpsLoading={isGpsLoading}
        />

        {/* Workspace content region right column */}
        <div className="flex-1 bg-transparent p-5 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[100vh] scrollbar-thin">
          
          {/* Upper Nav breadcrumb row */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-5 mb-6 gap-3 select-none">
              <div>
                <h2 className="text-3xl font-black font-display text-white tracking-tight flex items-center uppercase">
                  {weather?.city.name || "Aura"}
                  <span className="text-white ml-0.5">, IT</span>
                </h2>
                <p className="text-xs text-white/50 font-mono mt-1 block uppercase tracking-wider">
                  {lang === 'it' ? 'OGGI • ' : 'TODAY • '}{new Date().toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                </p>
              </div>

              {/* Date Card aligned nicely on the right like "14 Jan - 20 Jan 2023" in screenshot */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 border border-white/20 rounded-full text-xs font-medium hover:bg-white/10 transition-all text-white font-sans"
                >
                  {lang === 'it' ? 'Città Salvate' : 'Saved Places'}
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-white text-black hover:bg-white/90 rounded-full text-xs font-bold transition-all font-sans flex items-center space-x-1"
                >
                  <span>{lang === 'it' ? 'Aggiorna' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {/* Main Interactive Screen Content */}
            {errorText && (
              <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-4 text-xs font-sans text-rose-200 flex items-center mb-6 max-w-xl">
                <AlertCircle className="w-5 h-5 text-rose-400 mr-2 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            {renderTabContent()}
          </div>

          {/* Elegant Page footer */}
          <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-white/40 gap-2 select-none">
            <span>AURA ATMOSPHERE UTILITY APP • v1.0 • BOLD TYPOGRAPHY EDITION</span>
            <span>{isRefreshing ? (lang === 'it' ? 'SINCRONIZZAZIONE...' : 'SYNCING...') : (lang === 'it' ? 'CONNESSO' : 'DIRECT API LINK CONNECTED')}</span>
          </div>

        </div>

      </div>

    </div>
  );
}
