export type Language = 'it' | 'en';

export type UserProfile = 'freddoloso' | 'ufficio' | 'palestra' | 'tutto_giorno';

export interface WeatherCurrent {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  uvText: string;
  visibility: number;
  cloudCover: number;
  pressure: number;
  pressureTrend: 'constant' | 'rising' | 'falling';
  conditionCode: number;
  conditionText: string;
  prevDayTempDelta: number; // difference with yesterday at same hour
  lastUpdated: Date;
}

export interface WeatherHourlySlot {
  time: string; // "09:00"
  temp: number;
  conditionCode: number;
  conditionText: string;
  rainProb: number; // 0 - 100
  humidity: number;
  windSpeed: number;
  uvIndex: number;
}

export interface WeatherDailySlot {
  date: string; // "2026-05-21"
  dayName: string; // "Giovedì" or "Thursday"
  dominantConditionCode: number;
  dominantConditionText: string;
  tempMax: number;
  tempMin: number;
  rainProb: number;
}

export interface AirQualityData {
  aqi: number; // PM2.5 based AQI or standard index 1-5 or 0-500
  rating: 'Ottima' | 'Buona' | 'Discreta' | 'Scarsa' | 'Pessima';
  ratingEn: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
  recommendation: string; // Dynamic safety message
  recommendationEn: string;
}

export interface SunMoonData {
  sunrise: string; // "05:42"
  sunset: string; // "20:51"
  dayLength: string; // "15h 9m"
  daylightRemaining: string; // "x ore"
  moonPhase: number; // 0 to 1 value
  moonPhaseText: string; // "Crescente" or "Waxing Gibbous"
  moonPhaseTextEn: string;
}

export interface CityData {
  name: string;
  country: string;
  countryCode?: string;
  admin1?: string; // state/region
  lat: number;
  lon: number;
}

export interface WeatherData {
  city: CityData;
  current: WeatherCurrent;
  hourly: WeatherHourlySlot[];
  daily: WeatherDailySlot[];
  airQuality: AirQualityData;
  sunMoon: SunMoonData;
}

export interface SmartNotificationSettings {
  briefing: boolean;
  rain: boolean;
  tempChange: boolean;
  airQuality: boolean;
  silentStart: string; // "22:00"
  silentEnd: string; // "07:00"
}

export interface N8NConfig {
  webhookUrl: string;
  enabled: boolean;
}
