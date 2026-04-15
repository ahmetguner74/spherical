// ============================================
// weatherUtils — WMO hava kodu mapping + uçuş uygunluk hesaplama
// ============================================

import type { FlightSuitability, WeatherCurrent } from "@/types/iha";

// ─── Varsayılan Koordinatlar (Bursa) ───

export const BURSA_COORDS = { lat: 40.1885, lng: 29.061 };

// ─── WMO Hava Kodları → Türkçe + Emoji ───

interface WmoEntry {
  label: string;
  emoji: string;
}

const WMO_CODES: Record<number, WmoEntry> = {
  0: { label: "Açık", emoji: "☀️" },
  1: { label: "Az Bulutlu", emoji: "🌤️" },
  2: { label: "Parçalı Bulutlu", emoji: "⛅" },
  3: { label: "Kapalı", emoji: "☁️" },
  45: { label: "Sisli", emoji: "🌫️" },
  48: { label: "Kırağılı Sis", emoji: "🌫️" },
  51: { label: "Hafif Çisenti", emoji: "🌦️" },
  53: { label: "Çisenti", emoji: "🌦️" },
  55: { label: "Yoğun Çisenti", emoji: "🌧️" },
  61: { label: "Hafif Yağmur", emoji: "🌦️" },
  63: { label: "Yağmur", emoji: "🌧️" },
  65: { label: "Şiddetli Yağmur", emoji: "🌧️" },
  66: { label: "Dondurucu Yağmur", emoji: "🌧️" },
  67: { label: "Şiddetli Dondurucu Yağmur", emoji: "🌧️" },
  71: { label: "Hafif Kar", emoji: "🌨️" },
  73: { label: "Kar", emoji: "❄️" },
  75: { label: "Yoğun Kar", emoji: "❄️" },
  77: { label: "Kar Taneleri", emoji: "❄️" },
  80: { label: "Hafif Sağanak", emoji: "🌦️" },
  81: { label: "Sağanak", emoji: "🌧️" },
  82: { label: "Şiddetli Sağanak", emoji: "⛈️" },
  85: { label: "Hafif Kar Sağanağı", emoji: "🌨️" },
  86: { label: "Kar Sağanağı", emoji: "❄️" },
  95: { label: "Gök Gürültülü Fırtına", emoji: "⛈️" },
  96: { label: "Fırtına + Dolu", emoji: "⛈️" },
  99: { label: "Şiddetli Fırtına + Dolu", emoji: "⛈️" },
};

export function getWeatherLabel(code: number): string {
  return WMO_CODES[code]?.label ?? "Bilinmiyor";
}

export function getWeatherEmoji(code: number): string {
  return WMO_CODES[code]?.emoji ?? "🌡️";
}

// ─── Uçuş Uygunluk Eşikleri ───

const WIND_SAFE = 15;      // km/h
const WIND_RISKY = 30;     // km/h
const VIS_SAFE = 5000;     // metre
const VIS_RISKY = 2000;    // metre
const THUNDER_CODES = new Set([95, 96, 99]);
const HEAVY_RAIN_CODES = new Set([65, 67, 82, 86, 99]);

export function getFlightSuitability(weather: WeatherCurrent): FlightSuitability {
  // Fırtına → kesinlikle uygun değil
  if (THUNDER_CODES.has(weather.weatherCode)) return "uygun_degil";

  // Şiddetli yağış → uygun değil
  if (HEAVY_RAIN_CODES.has(weather.weatherCode)) return "uygun_degil";

  // Rüzgar kontrolü
  if (weather.windSpeed > WIND_RISKY) return "uygun_degil";

  // Görüş mesafesi kontrolü
  if (weather.visibility < VIS_RISKY) return "uygun_degil";

  // Riskli koşullar
  if (weather.windSpeed >= WIND_SAFE) return "riskli";
  if (weather.visibility < VIS_SAFE) return "riskli";
  if (weather.precipitation > 0.5) return "riskli";

  return "uygun";
}

export function getSuitabilityLabel(s: FlightSuitability): string {
  switch (s) {
    case "uygun": return "Uçuşa Uygun";
    case "riskli": return "Riskli";
    case "uygun_degil": return "Uygun Değil";
  }
}

export function getSuitabilityColor(s: FlightSuitability): string {
  switch (s) {
    case "uygun": return "var(--status-teslim)";       // yeşil
    case "riskli": return "var(--status-planlama)";     // sarı/turuncu
    case "uygun_degil": return "var(--feedback-error)"; // kırmızı
  }
}

// ─── Günlük tahmin için basit uygunluk ───

export function getDailySuitabilityFromWind(
  windMax: number,
  precipSum: number,
  code: number,
): FlightSuitability {
  if (THUNDER_CODES.has(code)) return "uygun_degil";
  if (HEAVY_RAIN_CODES.has(code)) return "uygun_degil";
  if (windMax > WIND_RISKY) return "uygun_degil";
  if (windMax >= WIND_SAFE || precipSum > 2) return "riskli";
  return "uygun";
}
