import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// WMO Weather codes mapper
function getWeatherDescription(code: number, lang: 'it' | 'en'): string {
  const dictionary: Record<number, { it: string; en: string }> = {
    0: { it: 'Sereno', en: 'Clear sky' },
    1: { it: 'Prevalentemente sereno', en: 'Mainly clear' },
    2: { it: 'Parzialmente nuvoloso', en: 'Partly cloudy' },
    3: { it: 'Coperto', en: 'Overcast' },
    45: { it: 'Nebbia', en: 'Fog' },
    48: { it: 'Nebbia brinosa', en: 'Depositing rime fog' },
    51: { it: 'Pioggerellina leggera', en: 'Light drizzle' },
    53: { it: 'Pioggerellina moderata', en: 'Moderate drizzle' },
    55: { it: 'Pioggerellina fitta', en: 'Dense drizzle' },
    56: { it: 'Pioggerellina gelida leggera', en: 'Light freezing drizzle' },
    57: { it: 'Pioggerellina gelida densa', en: 'Dense freezing drizzle' },
    61: { it: 'Pioggia debole', en: 'Slight rain' },
    63: { it: 'Pioggia moderata', en: 'Moderate rain' },
    65: { it: 'Pioggia forte', en: 'Heavy rain' },
    66: { it: 'Pioggia gelida leggera', en: 'Light freezing rain' },
    67: { it: 'Pioggia gelida forte', en: 'Heavy freezing rain' },
    71: { it: 'Neve debole', en: 'Slight snow fall' },
    73: { it: 'Neve moderata', en: 'Moderate snow fall' },
    75: { it: 'Neve forte', en: 'Heavy snow fall' },
    77: { it: 'Granuli di neve', en: 'Snow grains' },
    80: { it: 'Rovesci di pioggia deboli', en: 'Slight rain showers' },
    81: { it: 'Rovesci moderati', en: 'Moderate rain showers' },
    82: { it: 'Rovesci violenti', en: 'Violent rain showers' },
    85: { it: 'Rovesci di neve deboli', en: 'Slight snow showers' },
    86: { it: 'Rovesci di neve forti', en: 'Heavy snow showers' },
    95: { it: 'Temporale', en: 'Thunderstorm' },
    96: { it: 'Temporale con grandine debole', en: 'Thunderstorm with slight hail' },
    99: { it: 'Temporale con grandine forte', en: 'Thunderstorm with heavy hail' },
  };

  return dictionary[code]?.[lang] || (lang === 'it' ? 'Condizioni variabili' : 'Variable conditions');
}

// UV Index category generator
function getUVText(index: number, lang: 'it' | 'en'): string {
  if (index <= 2) return lang === 'it' ? 'Basso' : 'Low';
  if (index <= 5) return lang === 'it' ? 'Moderato' : 'Moderate';
  if (index <= 7) return lang === 'it' ? 'Alto' : 'High';
  if (index <= 10) return lang === 'it' ? 'Molto Alto' : 'Very High';
  return lang === 'it' ? 'Estremo' : 'Extreme';
}

// Micro-copy messages generator based on core rules in PRD
function getMicroCopyMessage(weatherCode: number, temp: number, humidity: number, uv: number, wind: number, rainProb2h: number, lang: 'it' | 'en'): string {
  if (rainProb2h > 50 || [51,53,55,61,63,65,80,81,82,95,96,99].includes(weatherCode)) {
    return lang === 'it' ? "L'ombrello? Sì, oggi." : "An umbrella? Yes, today.";
  }
  if (wind > 25) {
    return lang === 'it' ? "Vento sostenuto. Tieni il cappello." : "Strong breeze. Hold on to your hat.";
  }
  if (uv >= 6) {
    return lang === 'it' ? "UV alto: crema solare anche se è nuvoloso." : "High UV: wear sunscreen even if it's cloudy.";
  }
  if (humidity > 80 && temp > 24) {
    return lang === 'it' ? "Umidità alta. Si sentirà più caldo di quello che è." : "High humidity. It will feel hotter than it actually is.";
  }
  if (temp > 28) {
    return lang === 'it' ? "Molto caldo. Ricordati di bere molta acqua." : "Very hot today. Remember to drink plenty of water.";
  }
  if (temp < 10) {
    return lang === 'it' ? "Giornata fredda. Copriti bene prima di uscire." : "Chilly day. Wrap up warm before heading out.";
  }
  // Perfect day response
  return lang === 'it' ? "Nessuna allerta. Goditi la giornata." : "No warnings. Enjoy your day.";
}

// Simple moon phase calculator
function calculateMoonPhase(date: Date): { phase: number; nameIt: string; nameEn: string } {
  // Cycle of moon approx 29.53059 days
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const diffTime = date.getTime() - knownNewMoon.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const cycle = 29.530588853;
  let phase = (diffDays / cycle) % 1;
  if (phase < 0) phase += 1;

  let nameIt = "";
  let nameEn = "";

  if (phase < 0.03 || phase >= 0.97) {
    nameIt = "Luna Nuova";
    nameEn = "New Moon";
  } else if (phase >= 0.03 && phase < 0.22) {
    nameIt = "Luna Crescente";
    nameEn = "Waxing Crescent";
  } else if (phase >= 0.22 && phase < 0.28) {
    nameIt = "Primo Quarto";
    nameEn = "First Quarter";
  } else if (phase >= 0.28 && phase < 0.47) {
    nameIt = "Gibbosa Crescente";
    nameEn = "Waxing Gibbous";
  } else if (phase >= 0.47 && phase < 0.53) {
    nameIt = "Luna Piena";
    nameEn = "Full Moon";
  } else if (phase >= 0.53 && phase < 0.72) {
    nameIt = "Gibbosa Calante";
    nameEn = "Waning Gibbous";
  } else if (phase >= 0.72 && phase < 0.78) {
    nameIt = "Ultimo Quarto";
    nameEn = "Last Quarter";
  } else {
    nameIt = "Luna Calante";
    nameEn = "Waning Crescent";
  }

  return { phase, nameIt, nameEn };
}

// Resolve day name
function getDayName(dateStr: string, lang: 'it' | 'en'): string {
  const d = new Date(dateStr);
  if (lang === 'it') {
    return d.toLocaleDateString('it-IT', { weekday: 'long' });
  } else {
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }
}

// 1. Search Cities via Open-Meteo Geocoding API
app.get("/api/search-cities", async (req, res) => {
  const query = req.query.q as string;
  if (!query || query.trim().length < 2) {
    return res.json([]);
  }
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=it`;
    const response = await fetch(url);
    const data = (await response.json()) as any;
    const results = data.results || [];
    const formatted = results.map((r: any) => ({
      name: r.name,
      country: r.country,
      countryCode: r.country_code,
      admin1: r.admin1,
      lat: r.latitude,
      lon: r.longitude
    }));
    return res.json(formatted);
  } catch (error) {
    console.error("Geocoding search error:", error);
    return res.status(500).json({ error: "Failed to search cities" });
  }
});

// 2. Main Weather and AQI pipeline
app.get("/api/weather", async (req, res) => {
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : 45.4642; // standard Milan
  const lon = req.query.lon ? parseFloat(req.query.lon as string) : 9.1900;
  const cityName = (req.query.name as string) || "Milano";
  const customWebhook = req.query.webhook as string;
  const n8nEnabled = req.query.n8nEnabled === "true";

  // If n8n integration details are supplied and enabled, pass the request to n8n
  if (n8nEnabled && customWebhook) {
    try {
      console.log(`Routing weather fetch through n8n Webhook: ${customWebhook}`);
      const n8nRes = await fetch(customWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          cityName: cityName,
          timestamp: new Date().toISOString()
        })
      });
      if (n8nRes.ok) {
        const payload = await n8nRes.json();
        if (payload && payload.current) {
          // Verify that it is returned correctly and return it
          return res.json(payload);
        }
      }
      console.warn("n8n call did not return compliant format or failed, falling back to direct API connection");
    } catch (e) {
      console.error("Failed to connect to n8n webhook, falling back securely:", e);
    }
  }

  try {
    // 2.1 Fetch Weather (past_days=1 allows yesterday's hours comparison!)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index,visibility&hourly=temperature_2m,relative_humidity_2m,weather_code,precipitation_probability,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto&past_days=1`;
    const weatherRes = await fetch(weatherUrl);
    const weatherJson = (await weatherRes.json()) as any;

    // 2.2 Fetch Air Quality
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide`;
    const aqiRes = await fetch(aqiUrl);
    const aqiJson = (await aqiRes.json()) as any;

    if (!weatherJson || !weatherJson.current || !weatherJson.hourly) {
      return res.status(500).json({ error: "Empty answer from Open-Meteo" });
    }

    const currentData = weatherJson.current;
    const hourlyData = weatherJson.hourly;
    const dailyData = weatherJson.daily;

    // Resolve current index in hourly data
    // Open-Meteo with past_days=1 outputs yesterday (24 samples) then today
    const currentHourStr = currentData.time.substring(0, 13) + ":00";
    const curHourIdx = hourlyData.time.findIndex((t: string) => t.startsWith(currentHourStr));
    
    // Calculate Delta vs Yesterday Same Hour
    let yesterdayDelta = 0;
    if (curHourIdx !== -1 && curHourIdx >= 24) {
      const yesterdayTemp = hourlyData.temperature_2m[curHourIdx - 24];
      yesterdayDelta = currentData.temperature_2m - yesterdayTemp;
    }

    // Average precipitation probability in next 2 hours for micro-copy triggers
    let probRain2h = 0;
    if (curHourIdx !== -1) {
      const nextHour1 = hourlyData.precipitation_probability[curHourIdx] || 0;
      const nextHour2 = hourlyData.precipitation_probability[curHourIdx + 1] || 0;
      probRain2h = Math.max(nextHour1, nextHour2);
    }

    // Filter hourly data: next 24 elements starting from curHourIdx
    const startIdx = curHourIdx !== -1 ? curHourIdx : 24; // fallback
    const hourlySlots = [];
    for (let i = 0; i < 24; i++) {
      const idx = startIdx + i;
      if (idx < hourlyData.time.length) {
        const timeVal = new Date(hourlyData.time[idx]).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        hourlySlots.push({
          time: timeVal,
          temp: Math.round(hourlyData.temperature_2m[idx]),
          conditionCode: hourlyData.weather_code[idx],
          conditionText: getWeatherDescription(hourlyData.weather_code[idx], 'it'),
          rainProb: hourlyData.precipitation_probability[idx] || 0,
          humidity: hourlyData.relative_humidity_2m[idx] || 0,
          windSpeed: hourlyData.wind_speed_10m[idx] || 0,
          uvIndex: Math.round(hourlyData.uv_index[idx] || 0)
        });
      }
    }

    // Filter daily slots: 7 days
    const dailySlots = [];
    if (dailyData && dailyData.time) {
      for (let i = 0; i < dailyData.time.length; i++) {
        // Skip first day (yesterday) if OpenMeteo returns yesterday inside daily
        const dayStr = dailyData.time[i];
        const isPast = new Date(dayStr).toDateString() === new Date(Date.now() - 86400000).toDateString();
        if (isPast) continue;

        dailySlots.push({
          date: dayStr,
          dayName: getDayName(dayStr, 'it'),
          dominantConditionCode: dailyData.weather_code[i],
          dominantConditionText: getWeatherDescription(dailyData.weather_code[i], 'it'),
          tempMax: Math.round(dailyData.temperature_2m_max[i]),
          tempMin: Math.round(dailyData.temperature_2m_min[i]),
          rainProb: dailyData.precipitation_probability_max?.[i] || 0
        });
      }
    }

    // Format AQI
    const airCurr = aqiJson?.current || {};
    const ea_aqi = airCurr.european_aqi || 25; // standard
    
    // Classify AQI based on scale (0-25 Excellent, 26-50 Good, 51-75 Fair, 76-100 Poor, >100 Very Poor)
    let aqiRating: 'Ottima' | 'Buona' | 'Discreta' | 'Scarsa' | 'Pessima' = 'Buona';
    let aqiRatingEn: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor' = 'Good';
    let aqiRec = "Qualità dell'aria favorevole per attività all'aperto.";
    let aqiRecEn = "Air quality is pleasant for outdoor activities.";

    if (ea_aqi <= 25) {
      aqiRating = 'Ottima';
      aqiRatingEn = 'Excellent';
      aqiRec = 'Aria pulita. Buona giornata per una corsa.';
      aqiRecEn = 'Air is clean. Perfect day for an outdoor run.';
    } else if (ea_aqi <= 50) {
      aqiRating = 'Buona';
      aqiRatingEn = 'Good';
      aqiRec = "Aria complessivamente buona, nessun rischio particolare.";
      aqiRecEn = 'Good air quality with small risks.';
    } else if (ea_aqi <= 75) {
      aqiRating = 'Discreta';
      aqiRatingEn = 'Fair';
      aqiRec = 'Qualità dell\'aria sufficiente. I soggetti sensibili abbiano prudenza.';
      aqiRecEn = 'Fair air. Sensitive groups should exercise care.';
    } else if (ea_aqi <= 100) {
      aqiRating = 'Scarsa';
      aqiRatingEn = 'Poor';
      aqiRec = 'Aria abbastanza inquinata. Ridurre le attività prolungate all\'aperto.';
      aqiRecEn = 'Somewhat polluted. Cut back on outdoor strenuous efforts.';
    } else {
      aqiRating = 'Pessima';
      aqiRatingEn = 'Very Poor';
      aqiRec = 'Evita attività intensa all\'aperto. Fortemente sconsigliato sport all\'esterno.';
      aqiRecEn = 'Avoid heavy outdoor efforts. Indoor exercise is advised.';
    }

    // Sun and Moon details
    const todayDaily = dailyData || {};
    // Fetch current day indices (since yesterday was included with past_days=1, standard index is 1)
    const dIdx = todayDaily.time?.findIndex((day: string) => day === currentData.time.substring(0, 10)) ?? 1;
    const sunriseStr = todayDaily.sunrise?.[dIdx] || "";
    const sunsetStr = todayDaily.sunset?.[dIdx] || "";
    
    let sunriseTime = "06:00";
    let sunsetTime = "20:30";
    if (sunriseStr) sunriseTime = new Date(sunriseStr).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    if (sunsetStr) sunsetTime = new Date(sunsetStr).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

    // Calculate daylight
    let hoursDiff = 14;
    let minsDiff = 30;
    if (sunriseStr && sunsetStr) {
      const diffMs = new Date(sunsetStr).getTime() - new Date(sunriseStr).getTime();
      const totalMins = Math.floor(diffMs / (1000 * 60));
      hoursDiff = Math.floor(totalMins / 60);
      minsDiff = totalMins % 60;
    }

    // Calculate remaining daylight
    let daylightRemTextIt = "0h 0m";
    let daylightRemTextEn = "0h 0m";
    if (sunsetStr) {
      const nowMs = Date.now();
      const sunsetMs = new Date(sunsetStr).getTime();
      const remainingMs = sunsetMs - nowMs;
      if (remainingMs > 0) {
        const remMins = Math.floor(remainingMs / (1000 * 60));
        const rh = Math.floor(remMins / 60);
        const rm = remMins % 60;
        daylightRemTextIt = `${rh}h ${rm}m rimanenti`;
        daylightRemTextEn = `${rh}h ${rm}m remaining`;
      } else {
        daylightRemTextIt = "Sole tramontato";
        daylightRemTextEn = "Sun has set";
      }
    }

    const moon = calculateMoonPhase(new Date());

    const weatherPayload = {
      city: {
        name: cityName,
        country: "Italia",
        lat: lat,
        lon: lon
      },
      current: {
        temp: Math.round(currentData.temperature_2m),
        feelsLike: Math.round(currentData.apparent_temperature),
        humidity: currentData.relative_humidity_2m,
        windSpeed: currentData.wind_speed_10m,
        windDirection: currentData.wind_direction_10m,
        uvIndex: currentData.uv_index,
        uvText: getUVText(currentData.uv_index, 'it'),
        visibility: currentData.visibility / 1000, // convert meters to km
        cloudCover: currentData.cloud_cover,
        pressure: Math.round(currentData.pressure_msl),
        pressureTrend: currentData.pressure_msl > 1013 ? "rising" as const : "falling" as const,
        conditionCode: currentData.weather_code,
        conditionText: getWeatherDescription(currentData.weather_code, 'it'),
        prevDayTempDelta: Math.round(yesterdayDelta * 10) / 10,
        lastUpdated: new Date()
      },
      hourly: hourlySlots,
      daily: dailySlots,
      airQuality: {
        aqi: Math.round(ea_aqi),
        rating: aqiRating,
        ratingEn: aqiRatingEn,
        pm25: airCurr.pm2_5 || 12,
        pm10: airCurr.pm10 || 18,
        no2: airCurr.nitrogen_dioxide || 10,
        o3: airCurr.ozone || 45,
        so2: airCurr.sulphur_dioxide || 2,
        co: airCurr.carbon_monoxide || 0.4,
        recommendation: aqiRec,
        recommendationEn: aqiRecEn
      },
      sunMoon: {
        sunrise: sunriseTime,
        sunset: sunsetTime,
        dayLength: `${hoursDiff}h ${minsDiff}m`,
        daylightRemaining: daylightRemTextIt,
        daylightRemainingEn: daylightRemTextEn,
        moonPhase: Math.round(moon.phase * 100) / 100,
        moonPhaseText: moon.nameIt,
        moonPhaseTextEn: moon.nameEn
      }
    };

    return res.json(weatherPayload);
  } catch (error: any) {
    console.error("Fetch weather error:", error);
    return res.status(500).json({ error: error.message || "Failed to retrieve weather details" });
  }
});

// 3. Generative Suggestions "Cosa Metto Oggi"
app.post("/api/clothing-suggestion", async (req, res) => {
  const { weather, profile, lang } = req.body;

  if (!weather || !weather.current) {
    return res.status(400).json({ error: "Missing weather data" });
  }

  const temp = weather.current.temp;
  const feelsLike = weather.current.feelsLike;
  const condText = getWeatherDescription(weather.current.conditionCode, lang || 'it');
  const wind = weather.current.windSpeed;
  const humidity = weather.current.humidity;

  // Let's resolve the human chosen profile text
  let profileTopic = "";
  if (lang === 'it') {
    switch(profile) {
      case 'freddoloso': profileTopic = "Sono molto freddoloso (sente freddo facilmente)."; break;
      case 'ufficio': profileTopic = "Lavoro tutto il giorno in ufficio formale/colloqui."; break;
      case 'palestra': profileTopic = "Vado in palestra e faccio sport all'aperto oggi."; break;
      case 'tutto_giorno': profileTopic = "Sono fuori tutto il giorno a camminare."; break;
      default: profileTopic = "Attività ordinaria quotidiana.";
    }
  } else {
    switch(profile) {
      case 'freddoloso': profileTopic = "I get cold easily (sensitive to low temperatures)."; break;
      case 'ufficio': profileTopic = "I work all day in a semi-formal office context."; break;
      case 'palestra': profileTopic = "I plan to go to the gym and practice outdoor workout."; break;
      case 'tutto_giorno': profileTopic = "I will be outdoors walking the whole day."; break;
      default: profileTopic = "Regular daily routine.";
    }
  }

  const isIt = lang === 'it';

  const systemInstruction = isIt
    ? `Sei Astra, il consulente di abbigliamento empatico e saggio dell'app Aura.
       Il tuo compito è analizzare le condizioni meteo e consigliare l'abbigliamento perfetto.
       Mantieni il tono amichevole, conciso, e utilissimo (massimo 3-4 frasi in totale).
       NON dare consigli banali e NON ripetere in loop i dati numerici del meteo. Consiglia vestiti specifici, strati, accessori come scarpe adatte, ombrello, giacca adatta, occhiali da sole etc.
       Fornisci la tua risposta interamente scritta in lingua ITALIANA.`
    : `You are Astra, the empathetic and wise clothing consultant of the Aura app.
       Your job is to analyze the weather conditions and advise on the perfect outfit.
       Keep the tone friendly, concise, and incredibly useful (max 3-4 sentences total).
       DO NOT give cheesy warnings or repeat weather numbers in loop. Suggest layer combinations, shoes, exact jacket types, umbrellas, sunglasses etc.
       Respond entirely in ENGLISH.`;

  const prompt = isIt
    ? `Dati meteo per il consiglio d'abbigliamento:
       - Città: ${weather.city.name}
       - Temperatura reale: ${temp}°C (Percepita: ${feelsLike}°C)
       - Condizioni generali: ${condText}
       - Umidità: ${humidity}%
       - Vento: ${wind} km/h
       - Profilo utente: ${profileTopic}
       
       Genera un consiglio d'abbigliamento eccellente ("Cosa mi metto oggi?"), specifico, pratico e diretto in prima persona plurale o stile amichevole.`
    : `Weather data context for recommendations:
       - City: ${weather.city.name}
       - Real temperature: ${temp}°C (Feels like: ${feelsLike}°C)
       - Conditions: ${condText}
       - Humidity: ${humidity}%
       - Wind speed: ${wind} km/h
       - Special profile context: ${profileTopic}
       
       Generate an elegant, practical clothing suggestion ("What should I wear today?") customized for these conditions.`

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const text = response.text || (isIt ? "Vestiti comodo e preparati a tutto!" : "Dress comfortably and be ready for anything!");
    return res.json({ suggestion: text });
  } catch (err: any) {
    console.error("Gemini API error during suggestion:", err);
    // Fallback based on simple logic if Gemini fails or API keys are missing
    let fallbackText = "";
    if (isIt) {
      if (temp < 10) {
        fallbackText = `Fa freddo (${temp}°C). Consigliato un cappotto pesante o cappotto imbottito, sciarpa e scarpe calde. ${profile === 'freddoloso' ? 'Consigliamo assolutamente una maglia termica.' : ''}`;
      } else if (temp < 18) {
        fallbackText = `Clima fresco (${temp}°C) con ${condText}. Vestiti a strati: giacca leggera o impermeabile, felpa o maglioncino e sneakers comode.`;
      } else {
        fallbackText = `Giornata piacevole e calda (${temp}°C). T-shirt traspirante, jeans o pantaloncini leggeri. Porta degli occhiali da sole!`;
      }
    } else {
      if (temp < 10) {
        fallbackText = `It is cold (${temp}°C). We recommend a heavy coat or puffer jacket, scarf and warm boots. ${profile === 'freddoloso' ? 'Absolutely wear thermal underwear!' : ''}`;
      } else if (temp < 18) {
        fallbackText = `Cool climate (${temp}°C) with ${condText}. Wear layers: light jacket, sweater or hoodie and comfy sneakers.`;
      } else {
        fallbackText = `Warm day (${temp}°C). Breathable T-shirt, light pants or shorts. Bring sunglasses!`;
      }
    }
    return res.json({ suggestion: fallbackText, fallback: true });
  }
});

// 4. Test Webhook Connection
app.post("/api/test-n8n", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Missing URL path" });
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        test: true,
        message: "Aura webhook checking connection"
      })
    });
    const txt = await response.text();
    return res.json({ status: response.status, responseText: txt });
  } catch (error: any) {
    return res.json({ error: error.message || "Network request failed to n8n URL" });
  }
});

// Configure Vite integration for SPA development or static serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aura Server initialized and listening on port ${PORT}`);
  });
}

bootstrap();
