import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudSun, 
  MapPin, 
  Search, 
  Settings2, 
  Wind, 
  Sun, 
  Bell, 
  Webhook, 
  Navigation, 
  ChevronRight, 
  RefreshCw, 
  Trash2, 
  UserCircle2, 
  Languages, 
  Sparkles,
  Shirt
} from 'lucide-react';
import { CityData, WeatherData, Language, UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  setLang: (l: Language) => void;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  weather: WeatherData | null;
  savedCities: CityData[];
  onSelectCity: (city: CityData) => void;
  onAddCity: (city: CityData) => void;
  onRemoveCity: (city: CityData) => void;
  onUseGPS: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  clothingSuggestion: string;
  isGeneratingSuggestion: boolean;
  onGenerateSuggestion: () => void;
  isGpsLoading: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  profile,
  setProfile,
  weather,
  savedCities,
  onSelectCity,
  onAddCity,
  onRemoveCity,
  onUseGPS,
  onRefresh,
  isRefreshing,
  clothingSuggestion,
  isGeneratingSuggestion,
  onGenerateSuggestion,
  isGpsLoading
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Translate labels based on active language
  const t = {
    searchPlaceholder: lang === 'it' ? 'Cerca città...' : 'Search city...',
    savedPlaces: lang === 'it' ? 'Luoghi Salvati' : 'Saved Places',
    gpsOption: lang === 'it' ? 'Usa la mia posizione' : 'Use my position',
    gpsLoading: lang === 'it' ? 'Rilevamento...' : 'Locating...',
    sidebarAstraTitle: lang === 'it' ? 'Astra · Consulente' : 'Astra · Advisor',
    sidebarAstraDesc: lang === 'it' ? 'Clicca per ricalcolare consigli.' : 'Click to recalculate.',
    loadingSuggestion: lang === 'it' ? 'Leggendo l\'atmosfera...' : 'Reading the atmosphere...',
    menuMeteo: lang === 'it' ? 'Meteo & Previsioni' : 'Weather & Forecasts',
    menuCosaMetto: lang === 'it' ? 'Cosa Metto Oggi' : 'What To Wear Today',
    menuAria: lang === 'it' ? 'Qualità dell\'Aria' : 'Air Quality',
    menuArcoSolare: lang === 'it' ? 'Arco Solare & Luna' : 'Solar & Moon',
    menuNotifiche: lang === 'it' ? 'Notifiche Smart' : 'Smart Alerts',
    menuN8n: lang === 'it' ? 'Integrazione n8n' : 'n8n Automation',
    profileLabel: lang === 'it' ? 'Profilo Abbigliamento' : 'Clothing Profile',
    profileFreddoloso: lang === 'it' ? 'Freddoloso' : 'Sensitive to Cold',
    profileUfficio: lang === 'it' ? 'Lavoro Ufficio' : 'Office Professional',
    profilePalestra: lang === 'it' ? 'Sport / Palestra' : 'Active / Gym',
    profileTuttoGiorno: lang === 'it' ? 'Tutto il Giorno Fuori' : 'Outdoors All Day',
  };

  // Autocomplete Call
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search-cities?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowDropdown(data.length > 0);
        }
      } catch (err) {
        console.error("Error searching cities autocomplete:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle dropdown click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full md:w-[320px] bg-[#0A0A0B] text-white p-6 flex flex-col justify-between border-r border-white/10 shrink-0 select-none">
      
      {/* Upper Area */}
      <div>
        {/* Brand Name matching 'sparkstat' in size and fonts */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-full shadow-[0_0_6px_white]"></div>
            </div>
            <span className="font-display font-black text-2xl tracking-tighter text-white uppercase">
              aura<span className="text-white">.</span>
            </span>
          </div>
          <button 
            id="refresh-btn-sidebar"
            onClick={onRefresh} 
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-150 disabled:opacity-50 border border-white/10"
            title={lang === 'it' ? 'Aggiorna ora' : 'Refresh now'}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Dynamic AI Advisor Section (Mimicking the Profile Box in the sidebar screenshot) */}
        <div className="relative bg-white/5 rounded-2xl p-4 border border-white/10 mb-6 group overflow-hidden">
          {/* Decorative glowing gradient backdrop */}
          <div className="absolute -inset-1 bg-gradient-to-r from-white/5 to-indigo-505/5 rounded-2xl blur-lg transition duration-1000 group-hover:duration-200" />
          
          <div className="relative flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center border border-white/20 shadow-inner">
                <Shirt className="w-6 h-6 text-black" />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0A0A0B] rounded-full" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate font-sans flex items-center uppercase tracking-wide">
                {t.sidebarAstraTitle} 
                <Sparkles className="w-3.5 h-3.5 ml-1 text-white fill-white animate-bounce" />
              </h4>
              <p className="text-xs text-white/40 font-mono truncate">{weather?.city.name || 'Milano'}, IT</p>
            </div>
          </div>

          {/* Autogenerated garments suggestion preview */}
          <div className="relative bg-black/40 rounded-xl p-3 border border-white/10 text-xs text-white/80 min-h-[75px] max-h-[140px] overflow-y-auto leading-relaxed scrollbar-thin">
            {isGeneratingSuggestion ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div className="flex space-x-1.5 justify-center items-center font-mono">
                  <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
                </div>
                <span className="text-[10px] text-white/50 font-mono italic">{t.loadingSuggestion}</span>
              </div>
            ) : (
              <p className="font-sans font-light italic text-[11px] leading-relaxed select-text text-white/90">
                "{clothingSuggestion || (lang === 'it' 
                  ? 'Usa il bottone sotto per generare un consiglio personalizzato.' 
                  : 'Click the action button below to compose tailored styling suggestions.')}"
              </p>
            )}
          </div>

          {/* Prompt action trigger */}
          <button
            id="recalc-wardrobe-btn"
            onClick={onGenerateSuggestion}
            disabled={isGeneratingSuggestion || !weather}
            className="w-full mt-3 bg-white hover:bg-white/95 text-black font-sans text-xs font-bold py-2.5 px-3 rounded-lg active:scale-95 transition-all duration-150 flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span className="uppercase tracking-wider text-[10px]">{lang === 'it' ? 'Consiglio Astra' : 'Astra Advice'}</span>
          </button>
        </div>

        {/* Autocomplete City Search Container */}
        <div ref={dropdownRef} className="relative mb-6">
          <div className="relative">
            <input
              id="city-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 text-white placeholder-white/30 text-sm font-sans rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-200"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
            {isSearching && (
              <div className="absolute right-3.5 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Autocomplete Dropdown List */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-[#121214] border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-white/5 max-h-60 overflow-y-auto">
              {searchResults.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelectCity(item);
                    onAddCity(item);
                    setSearchQuery('');
                    setShowDropdown(false);
                  }}
                  className="w-full text-left font-sans text-xs py-2.5 px-3.5 text-white/80 hover:bg-white/5 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{item.name}</span>
                    <span className="text-[10px] text-white/40">
                      {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                    </span>
                  </div>
                  <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS Locator Shortcut */}
        <div className="mb-6">
          <button
            id="gps-navigation-btn"
            onClick={onUseGPS}
            disabled={isGpsLoading}
            className="w-full font-sans text-[11px] bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 px-3 border border-white/10 rounded-xl transition-all duration-150 flex items-center justify-center space-x-2 disabled:opacity-50 uppercase tracking-widest"
          >
            <Navigation className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-bounce' : ''}`} />
            <span>{isGpsLoading ? t.gpsLoading : t.gpsOption}</span>
          </button>
        </div>

        {/* Saved Cities List */}
        {savedCities.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-mono font-bold mb-2.5">
              Ref. {t.savedPlaces}
            </p>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {savedCities.map((item, index) => {
                const isActive = weather?.city.name.toLowerCase() === item.name.toLowerCase();
                return (
                  <div 
                    key={index}
                    className={`group flex items-center justify-between py-2 px-3 rounded-lg text-xs font-sans transition-all duration-150 cursor-pointer ${
                      isActive 
                        ? 'bg-white/15 text-white font-bold border-l-2 border-white' 
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                    onClick={() => onSelectCity(item)}
                  >
                    <span className="truncate flex-1 font-sans">{item.name}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[9px] text-white/60 font-mono uppercase bg-white/10 px-1.5 py-0.5 rounded">
                        {item.countryCode || 'IT'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveCity(item);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        title="Rimuovi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sidebar Navigation Section */}
        <div className="space-y-1">
          {[
            { id: 'dashboard', label: t.menuMeteo, icon: CloudSun },
            { id: 'clothing', label: t.menuCosaMetto, icon: Shirt },
            { id: 'aqi', label: t.menuAria, icon: Wind },
            { id: 'sunmoon', label: t.menuArcoSolare, icon: Sun },
            { id: 'notifications', label: t.menuNotifiche, icon: Bell },
            { id: 'n8n', label: t.menuN8n, icon: Webhook }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left font-sans text-xs py-2.5 px-3.5 rounded-xl transition-all duration-200 flex items-center justify-between ${
                  isSelected 
                    ? 'bg-white text-black font-bold shadow-md active:scale-98' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-black' : 'text-white/40'}`} />
                  <span>{item.label}</span>
                </div>
                {isSelected && <ChevronRight className="w-3.5 h-3.5 text-black shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Area: Controls for Language & Profile Selector mirroring 'Logout' */}
      <div className="pt-6 border-t border-white/10 mt-6 space-y-4">
        {/* Wardrobe Profile Dynamic Selector */}
        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
          <div className="flex items-center space-x-1.5 mb-2 text-white/40">
            <UserCircle2 className="w-3.5 h-3.5 text-white" />
            <span className="text-[10px] uppercase font-mono tracking-wide font-semibold">
              {t.profileLabel}
            </span>
          </div>
          <select
            id="clothing-profile-selector"
            value={profile}
            onChange={(e) => setProfile(e.target.value as UserProfile)}
            className="w-full bg-[#0A0A0B] text-white text-xs font-sans rounded-lg py-1.5 px-2 border border-white/10 focus:outline-none focus:border-white focus:ring-1 focus:ring-white cursor-pointer"
          >
            <option value="freddoloso" className="bg-[#0A0A0B] text-white">{t.profileFreddoloso}</option>
            <option value="ufficio" className="bg-[#0A0A0B] text-white">{t.profileUfficio}</option>
            <option value="palestra" className="bg-[#0A0A0B] text-white">{t.profilePalestra}</option>
            <option value="tutto_giorno" className="bg-[#0A0A0B] text-white">{t.profileTuttoGiorno}</option>
          </select>
        </div>

        {/* Language selector aligned neatly with metadata icons */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2 text-white/40">
            <Languages className="w-4 h-4" />
            <span className="text-xs font-sans">Language</span>
          </div>
          <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setLang('it')}
              className={`px-2.5 py-1 rounded-md transition-all font-mono font-bold ${
                lang === 'it' 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              IT
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-md transition-all font-mono font-bold ${
                lang === 'en' 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Micro-Copyright / Signature */}
        <div className="text-[10px] font-mono text-white/20 text-center select-text">
          Aura · 2026-05-21 · v1.0
        </div>
      </div>

    </div>
  );
}
