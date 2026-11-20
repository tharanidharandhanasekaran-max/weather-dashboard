const API = {
  geocoding: "https://geocoding-api.open-meteo.com/v1/search",
  forecast: "https://api.open-meteo.com/v1/forecast"
};

const WEATHER_CODES = {
  0: { label: "Clear sky", symbol: "☀" },
  1: { label: "Mainly clear", symbol: "🌤" },
  2: { label: "Partly cloudy", symbol: "⛅" },
  3: { label: "Overcast", symbol: "☁" },
  45: { label: "Fog", symbol: "〰" },
  48: { label: "Depositing rime fog", symbol: "〰" },
  51: { label: "Light drizzle", symbol: "🌦" },
  53: { label: "Moderate drizzle", symbol: "🌦" },
  55: { label: "Dense drizzle", symbol: "🌧" },
  56: { label: "Light freezing drizzle", symbol: "🌧" },
  57: { label: "Dense freezing drizzle", symbol: "🌧" },
  61: { label: "Slight rain", symbol: "🌦" },
  63: { label: "Moderate rain", symbol: "🌧" },
  65: { label: "Heavy rain", symbol: "🌧" },
  66: { label: "Light freezing rain", symbol: "🌧" },
  67: { label: "Heavy freezing rain", symbol: "🌧" },
  71: { label: "Slight snowfall", symbol: "🌨" },
  73: { label: "Moderate snowfall", symbol: "❄" },
  75: { label: "Heavy snowfall", symbol: "❄" },
  77: { label: "Snow grains", symbol: "❄" },
  80: { label: "Slight rain showers", symbol: "🌦" },
  81: { label: "Moderate rain showers", symbol: "🌧" },
  82: { label: "Violent rain showers", symbol: "🌧" },
  85: { label: "Slight snow showers", symbol: "🌨" },
  86: { label: "Heavy snow showers", symbol: "❄" },
  95: { label: "Thunderstorm", symbol: "⛈" },
  96: { label: "Thunderstorm with hail", symbol: "⛈" },
  99: { label: "Thunderstorm with heavy hail", symbol: "⛈" }
};

const form = document.getElementById("form");
const cityInput = document.getElementById("city");
const searchButton = document.getElementById("search-button");
const statusMessage = document.getElementById("status");
const weatherContent = document.getElementById("weather-content");

function weatherInfo(code) {
  return WEATHER_CODES[code] || { label: "Unknown conditions", symbol: "☁" };
}

async function findCity(name) {
  const url = `${API.geocoding}?count=1&language=en&format=json&name=${encodeURIComponent(name)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("The city search service is not responding. Please try again.");
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Check the spelling and try another city.");
  }
  const city = data.results[0];
  return {
    name: city.name,
    country: city.country || "",
    latitude: city.latitude,
    longitude: city.longitude
  };
}

async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: "temperature_2m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    forecast_days: "5",
    timezone: "auto"
  });
  const response = await fetch(`${API.forecast}?${params}`);
  if (!response.ok) throw new Error("Could not load the weather forecast. Please try again.");
  return response.json();
}

function formatDay(dateString, options) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString(undefined, options);
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function renderWeather(city, weather) {
  const current = weather.current;
  const daily = weather.daily;
  const todayInfo = weatherInfo(current.weather_code);

  document.getElementById("city-name").textContent =
    city.country ? `${city.name}, ${city.country}` : city.name;
  document.getElementById("current-date").textContent =
    formatDay(current.time.slice(0, 10), { weekday: "long", day: "numeric", month: "long" });
  document.getElementById("current-symbol").textContent = todayInfo.symbol;
  document.getElementById("current-temperature").textContent = Math.round(current.temperature_2m);
  document.getElementById("current-condition").textContent = todayInfo.label;
  document.getElementById("today-high").textContent = `${Math.round(daily.temperature_2m_max[0])}°C`;
  document.getElementById("today-low").textContent = `${Math.round(daily.temperature_2m_min[0])}°C`;
  document.getElementById("current-range").textContent =
    `Feels like a high of ${Math.round(daily.temperature_2m_max[0])}° today`;
  document.getElementById("local-time").textContent = current.time.slice(11, 16);

  const forecastGrid = document.getElementById("forecast-grid");
  forecastGrid.replaceChildren();

  daily.time.forEach((date, index) => {
    const info = weatherInfo(daily.weather_code[index]);
    const card = document.createElement("article");
    card.className = "forecast-card";

    const day = document.createElement("p");
    day.className = "forecast-day";
    day.textContent = index === 0 ? "Today" : formatDay(date, { weekday: "short" });

    const symbol = document.createElement("div");
    symbol.className = "forecast-symbol";
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = info.symbol;

    const label = document.createElement("p");
    label.className = "forecast-label";
    label.textContent = info.label;

    const temps = document.createElement("div");
    temps.className = "forecast-temps";
    const high = document.createElement("span");
    high.textContent = `${Math.round(daily.temperature_2m_max[index])}°`;
    const low = document.createElement("span");
    low.textContent = `${Math.round(daily.temperature_2m_min[index])}°`;
    temps.append(high, low);

    card.append(day, symbol, label, temps);
    forecastGrid.append(card);
  });

  weatherContent.hidden = false;
}

async function searchWeather(cityName) {
  const trimmedName = cityName.trim();
  if (!trimmedName) {
    weatherContent.hidden = true;
    setStatus("Type a city name before searching.", true);
    cityInput.focus();
    return;
  }

  searchButton.disabled = true;
  searchButton.querySelector("span:first-child").textContent = "Loading";
  setStatus("Finding your city and fetching live weather...");
  weatherContent.hidden = true;

  try {
    const city = await findCity(trimmedName);
    const weather = await getWeather(city.latitude, city.longitude);
    renderWeather(city, weather);
    localStorage.setItem("skycast-last-city", city.name);
    setStatus(`Weather updated for ${city.name}.`);
  } catch (error) {
    setStatus(error instanceof TypeError
      ? "Network problem. Check your internet connection and try again."
      : error.message || "Something went wrong. Please try again.", true);
  } finally {
    searchButton.disabled = false;
    searchButton.querySelector("span:first-child").textContent = "Search";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  searchWeather(cityInput.value);
});

const savedCity = localStorage.getItem("skycast-last-city");
if (savedCity) {
  cityInput.value = savedCity;
  searchWeather(savedCity);
}
