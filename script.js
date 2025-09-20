// script.js
const API_KEY = "67d199f2bb5068fca21754798eac0100";

// DOM elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const currentWeather = document.getElementById('current-weather');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const weatherIcon = document.getElementById('weather-icon');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const feelsLike = document.getElementById('feels-like');
const forecast = document.getElementById('forecast');

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    }
});

locationBtn.addEventListener('click', getWeatherByLocation);

// Function to get weather by city name
function getWeatherByCity(city) {
    showLoading();

    // Fetch current weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayCurrentWeather(data);
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Forecast not available');
            }
            return response.json();
        })
        .then(data => {
            displayForecast(data);
            hideLoading();
        })
        .catch(err => {
            showError(err.message);
            hideLoading();
        });
}

// Function to get weather by user's location
function getWeatherByLocation() {
    showLoading();

    if (!navigator.geolocation) {
        showError("Geolocation is not supported by your browser");
        hideLoading();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Fetch current weather
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Weather data not available');
                    }
                    return response.json();
                })
                .then(data => {
                    displayCurrentWeather(data);
                    return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Forecast not available');
                    }
                    return response.json();
                })
                .then(data => {
                    displayForecast(data);
                    hideLoading();
                })
                .catch(err => {
                    showError(err.message);
                    hideLoading();
                });
        },
        err => {
            showError("Unable to retrieve your location");
            hideLoading();
        }
    );
}

// Function to display current weather
function displayCurrentWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    weatherDescription.textContent = data.weather[0].description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;

    currentWeather.style.display = 'block';
    error.style.display = 'none';
}

// Function to display forecast
function displayForecast(data) {
    forecast.innerHTML = '';

    // Get forecast for next 5 days (every day at 12:00)
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const icon = day.weather[0].icon;

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
                        <div><strong>${dayName}</strong></div>
                        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${day.weather[0].description}">
                        <div>${temp}°C</div>
                        <div>${day.weather[0].description}</div>
                    `;

        forecast.appendChild(forecastItem);
    });
}

// Helper functions
function showLoading() {
    loading.style.display = 'block';
    currentWeather.style.display = 'none';
    error.style.display = 'none';
    forecast.innerHTML = '';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
    currentWeather.style.display = 'none';
    forecast.innerHTML = '';
}

// Get weather for user's location on page load
window.addEventListener('load', getWeatherByLocation);