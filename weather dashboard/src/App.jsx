
import React, { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  const getCondition = (code) => {
    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    if (code <= 82) return "Rain Showers";
    if (code <= 99) return "Thunderstorm";
    return "Unknown";
  };

  const getIcon = (code) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    if (code <= 99) return "⛈️";
    return "🌤️";
  };

  const getWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    try {
      setError("");
      setWeather(null);
      setForecast([]);

      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );

      const geoData = await geoResponse.json();

      if (!geoData.results) {
        setError("City not found!");
        return;
      }

      const place = geoData.results[0];

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`
      );

      const data = await response.json();

      setWeather({
        name: place.name,
        country: place.country,
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m,
        feelsLike: data.current.apparent_temperature,
        code: data.current.weather_code
      });

      const days = data.daily.time.map((date, index) => ({
        date,
        code: data.daily.weather_code[index],
        max: data.daily.temperature_2m_max[index],
        min: data.daily.temperature_2m_min[index]
      }));

      setForecast(days);

    } catch (err) {
      setError("Unable to fetch weather data");
    }
  };

  return (
    <div className="container">
      <div className="dashboard">

        <h1>🌤 Weather Dashboard</h1>
        <p>Check current weather and 7-day forecast</p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && getWeather()
            }
          />

          <button onClick={getWeather}>
            Search
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {weather && (
          <>
            <div className="weather-card">

              <h2>
                {weather.name}, {weather.country}
              </h2>

              <div className="weather-icon">
                {getIcon(weather.code)}
              </div>

              <h1>{weather.temperature}°C</h1>

              <h3>{getCondition(weather.code)}</h3>

              <p>Feels Like: {weather.feelsLike}°C</p>

              <div className="details">
                <div>
                  <h3>💧</h3>
                  <p>Humidity</p>
                  <h3>{weather.humidity}%</h3>
                </div>

                <div>
                  <h3>💨</h3>
                  <p>Wind Speed</p>
                  <h3>{weather.wind} km/h</h3>
                </div>
              </div>
            </div>

            <h2 className="forecast-title">
              7-Day Weather Forecast
            </h2>

            <div className="forecast-container">
              {forecast.map((day, index) => (
                <div className="forecast-card" key={day.date}>

                  <h3>
                    {index === 0
                      ? "Today"
                      : new Date(
                          day.date + "T12:00:00"
                        ).toLocaleDateString("en-US", {
                          weekday: "short"
                        })}
                  </h3>

                  <div className="forecast-icon">
                    {getIcon(day.code)}
                  </div>

                  <p>{getCondition(day.code)}</p>

                  <h3>
                    {Math.round(day.max)}° /
                    {Math.round(day.min)}°
                  </h3>

                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default App;
