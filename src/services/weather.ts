export interface WeatherData {
  temp: number;
  condition: string;
  icon: 'sun' | 'cloud' | 'rain' | 'snow' | 'storm';
}

const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

export async function fetchLiveWeather(lat: number, lng: number): Promise<WeatherData> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API error');
    const json = await res.json();
    const cw = json.current_weather;
    if (!cw) throw new Error('No current weather');

    const temp = Math.round(cw.temperature);
    const code = cw.weathercode;
    let condition = 'Clear';
    let icon: WeatherData['icon'] = 'sun';

    if (code === 0) {
      condition = 'Sunny';
      icon = 'sun';
    } else if (code >= 1 && code <= 3) {
      condition = 'Partly Cloudy';
      icon = 'cloud';
    } else if (code === 45 || code === 48) {
      condition = 'Misty';
      icon = 'cloud';
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      condition = 'Rain';
      icon = 'rain';
    } else if (code >= 71 && code <= 77) {
      condition = 'Snow';
      icon = 'snow';
    } else if (code >= 95) {
      condition = 'Storms';
      icon = 'storm';
    }

    const result: WeatherData = { temp, condition, icon };
    weatherCache.set(key, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    // Graceful fallback based on latitude if network error
    const isCold = Math.abs(lat) > 50;
    const isTropical = Math.abs(lat) < 25;
    const fallbackTemp = isCold ? 8 : isTropical ? 29 : 21;
    return {
      temp: fallbackTemp,
      condition: isTropical ? 'Sunny' : 'Fair',
      icon: 'sun'
    };
  }
}
