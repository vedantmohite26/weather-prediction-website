// Weather App - Main JavaScript File
// TODO: maybe add more weather providers later?

const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';  // my openweather api key
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// grabbing all the DOM elements i need
const elements = {
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    saveLocationBtn: document.getElementById('saveLocationBtn'),
    savedLocationsBtn: document.getElementById('savedLocationsBtn'),
    savedLocationsModal: document.getElementById('savedLocationsModal'),
    closeModal: document.getElementById('closeModal'),
    savedLocationsList: document.getElementById('savedLocationsList'),
    unitToggle: document.getElementById('unitToggle'),
    loader: document.getElementById('loader'),
    errorMessage: document.getElementById('errorMessage'),
    currentWeather: document.getElementById('currentWeather'),
    forecast: document.getElementById('forecast'),
    hourlyForecast: document.getElementById('hourlyForecast'),
    airQualityUV: document.getElementById('airQualityUV'),
    sunTimes: document.getElementById('sunTimes'),
    temperatureChart: document.getElementById('temperatureChart'),
    weatherAlerts: document.getElementById('weatherAlerts'),
    cityName: document.getElementById('cityName'),
    currentDate: document.getElementById('currentDate'),
    temperature: document.getElementById('temperature'),
    weatherIcon: document.getElementById('weatherIcon'),
    weatherDescription: document.getElementById('weatherDescription'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    feelsLike: document.getElementById('feelsLike'),
    pressure: document.getElementById('pressure'),
    visibility: document.getElementById('visibility'),
    cloudiness: document.getElementById('cloudiness'),
    forecastContainer: document.getElementById('forecastContainer'),
    hourlyContainer: document.getElementById('hourlyContainer'),
    aqiValue: document.getElementById('aqiValue'),
    aqiLevel: document.getElementById('aqiLevel'),
    pollutants: document.getElementById('pollutants'),
    uvValue: document.getElementById('uvValue'),
    uvLevel: document.getElementById('uvLevel'),
    uvRecommendation: document.getElementById('uvRecommendation'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    dayLength: document.getElementById('dayLength')
};

// state stuff
let currentUnit = 'metric';
let lastSearchedCity = null;
let currentCoordinates = null;
let temperatureChartInstance = null;

const STORAGE_KEY = 'savedWeatherLocations';

// get saved locations from local storage
function getSavedLocations() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

// save a location
function saveLocation(cityName, country, lat, lon) {
    const locations = getSavedLocations();
    const locationData = { cityName, country, lat, lon };

    // check if already exists
    const exists = locations.some(loc =>
        loc.cityName === cityName && loc.country === country
    );

    if (!exists) {
        locations.push(locationData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
        updateSavedLocationsList();
        return true;
    }
    return false;
}

function removeLocation(cityName, country) {
    let locations = getSavedLocations();
    locations = locations.filter(loc =>
        !(loc.cityName === cityName && loc.country === country)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    updateSavedLocationsList();
}

// weather icons mapping
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '🌤️';
}

// helper functions
function showLoader() {
    elements.loader.classList.remove('hidden');
    // hide everything else
    elements.currentWeather.classList.add('hidden');
    elements.forecast.classList.add('hidden');
    elements.hourlyForecast.classList.add('hidden');
    elements.airQualityUV.classList.add('hidden');
    elements.sunTimes.classList.add('hidden');
    elements.temperatureChart.classList.add('hidden');
    elements.weatherAlerts.classList.add('hidden');
    elements.errorMessage.classList.add('hidden');
}

function hideLoader() {
    elements.loader.classList.add('hidden');
}

function showError(message) {
    hideLoader();
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.remove('hidden');
    // hide all weather sections
    elements.currentWeather.classList.add('hidden');
    elements.forecast.classList.add('hidden');
    elements.hourlyForecast.classList.add('hidden');
    elements.airQualityUV.classList.add('hidden');
    elements.sunTimes.classList.add('hidden');
    elements.temperatureChart.classList.add('hidden');
    elements.weatherAlerts.classList.add('hidden');
}

// date formatting
const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

const formatForecastDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatHourTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
};

function formatTemp(temp) {
    return Math.round(temp);
}

function getUnitSymbol() {
    return currentUnit === 'metric' ? '°C' : '°F';
}

function getWindSpeedUnit() {
    return currentUnit === 'metric' ? 'm/s' : 'mph';
}

function calculateDayLength(sunrise, sunset) {
    const duration = sunset - sunrise;
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

// API CALLS

async function fetchWeatherByCity(city) {
    const response = await fetch(
        `${API_BASE_URL}/weather?q=${city}&units=${currentUnit}&appid=${API_KEY}`
    );

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('City not found. Please check the spelling and try again.');
        }
        throw new Error('Unable to fetch weather data. Please try again later.');
    }

    return await response.json();
}

async function fetchWeatherByCoords(lat, lon) {
    const response = await fetch(
        `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`
    );

    if (!response.ok) {
        throw new Error('Unable to fetch weather data for your location.');
    }

    return await response.json();
}

async function fetchForecast(lat, lon) {
    const response = await fetch(
        `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`
    );

    if (!response.ok) {
        throw new Error('Unable to fetch forecast data.');
    }

    return await response.json();
}

async function fetchAirQuality(lat, lon) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );

        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Air quality data unavailable:', error);
    }
    return null;
}

// DISPLAY FUNCTIONS

function displayCurrentWeather(data) {
    elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
    elements.currentDate.textContent = formatDate(data.dt);
    elements.temperature.textContent = `${formatTemp(data.main.temp)}${getUnitSymbol()}`;
    elements.weatherIcon.textContent = getWeatherIcon(data.weather[0].icon);
    elements.weatherDescription.textContent = data.weather[0].description;
    elements.humidity.textContent = `${data.main.humidity}%`;
    elements.windSpeed.textContent = `${data.wind.speed} ${getWindSpeedUnit()}`;
    elements.feelsLike.textContent = `${formatTemp(data.main.feels_like)}${getUnitSymbol()}`;
    elements.pressure.textContent = `${data.main.pressure} hPa`;
    elements.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    elements.cloudiness.textContent = `${data.clouds.all}%`;

    // show save button
    elements.saveLocationBtn.classList.remove('hidden');

    hideLoader();
    elements.currentWeather.classList.remove('hidden');
}

function displayForecast(data) {
    const dailyForecasts = [];
    const processedDates = new Set();

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toDateString();

        if (!processedDates.has(dateString)) {
            const hour = date.getHours();
            // prefer midday forecasts
            if (hour >= 11 && hour <= 14) {
                dailyForecasts.push(item);
                processedDates.add(dateString);
            } else if (dailyForecasts.length < 5 && !processedDates.has(dateString)) {
                dailyForecasts.push(item);
                processedDates.add(dateString);
            }
        }
    });

    const forecastsToShow = dailyForecasts.slice(0, 5);

    elements.forecastContainer.innerHTML = '';

    forecastsToShow.forEach(item => {
        const card = document.createElement('div');
        card.className = 'forecast-card';

        card.innerHTML = `
            <div class="forecast-date">${formatForecastDate(item.dt)}</div>
            <div class="forecast-icon">${getWeatherIcon(item.weather[0].icon)}</div>
            <div class="forecast-temp">${formatTemp(item.main.temp)}${getUnitSymbol()}</div>
            <div class="forecast-temp-range">
                H: ${formatTemp(item.main.temp_max)}${getUnitSymbol()} 
                L: ${formatTemp(item.main.temp_min)}${getUnitSymbol()}
            </div>
            <div class="forecast-desc">${item.weather[0].description}</div>
        `;

        elements.forecastContainer.appendChild(card);
    });

    elements.forecast.classList.remove('hidden');
}

function displayHourlyForecast(data) {
    elements.hourlyContainer.innerHTML = '';

    // next 24 hours - showing 8 intervals (3 hours each)
    const hourlyData = data.list.slice(0, 8);

    hourlyData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'hourly-card';

        card.innerHTML = `
            <div class="hourly-time">${formatHourTime(item.dt)}</div>
            <div class="hourly-icon">${getWeatherIcon(item.weather[0].icon)}</div>
            <div class="hourly-temp">${formatTemp(item.main.temp)}${getUnitSymbol()}</div>
            <div class="hourly-desc">${item.weather[0].description}</div>
        `;

        elements.hourlyContainer.appendChild(card);
    });

    elements.hourlyForecast.classList.remove('hidden');
}

function displayAirQuality(data) {
    if (!data) {
        elements.airQualityUV.classList.add('hidden');
        return;
    }

    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;

    // aqi levels: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
    const aqiLevels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqiClasses = ['', 'aqi-good', 'aqi-fair', 'aqi-moderate', 'aqi-poor', 'aqi-very-poor'];

    elements.aqiValue.textContent = aqi;
    elements.aqiLevel.textContent = aqiLevels[aqi];
    elements.aqiLevel.className = `aqi-level ${aqiClasses[aqi]}`;

    // display pollutants
    elements.pollutants.innerHTML = `
        <div class="pollutant-item">
            <div class="pollutant-name">PM2.5</div>
            <div class="pollutant-value">${components.pm2_5.toFixed(1)}</div>
        </div>
        <div class="pollutant-item">
            <div class="pollutant-name">PM10</div>
            <div class="pollutant-value">${components.pm10.toFixed(1)}</div>
        </div>
        <div class="pollutant-item">
            <div class="pollutant-name">O₃</div>
            <div class="pollutant-value">${components.o3.toFixed(1)}</div>
        </div>
        <div class="pollutant-item">
            <div class="pollutant-name">NO₂</div>
            <div class="pollutant-value">${components.no2.toFixed(1)}</div>
        </div>
    `;
}

// UV index display
// NOTE: real UV data needs One Call API subscription
// using simulated values based on time for now
function displayUVIndex(weatherData) {
    const hour = new Date().getHours();
    let uvIndex = 0;

    // simulate UV based on time of day
    if (hour >= 10 && hour <= 16) {
        uvIndex = Math.floor(Math.random() * 6) + 5;  // peak sun hours
    } else if (hour >= 8 && hour < 10 || hour > 16 && hour <= 18) {
        uvIndex = Math.floor(Math.random() * 3) + 2;  // morning/evening
    } else {
        uvIndex = Math.floor(Math.random() * 2);  // night/early morning
    }

    const uvLevels = ['Low', 'Low', 'Low', 'Moderate', 'Moderate', 'Moderate', 'High', 'High', 'Very High', 'Very High', 'Extreme', 'Extreme'];
    const uvClasses = ['uv-low', 'uv-low', 'uv-low', 'uv-moderate', 'uv-moderate', 'uv-moderate', 'uv-high', 'uv-high', 'uv-very-high', 'uv-very-high', 'uv-extreme', 'uv-extreme'];
    const uvRecommendations = [
        'No protection needed',
        'No protection needed',
        'Wear sunglasses on bright days',
        'Stay in shade near midday, wear sun protection',
        'Stay in shade near midday, wear sun protection',
        'Reduce time in sun between 10am-4pm',
        'Minimize sun exposure between 10am-4pm',
        'Avoid sun between 10am-4pm, seek shade',
        'Avoid sun between 10am-4pm, seek shade',
        'Take all precautions: avoid sun 10am-4pm',
        'Take all precautions: avoid sun 10am-4pm',
        'Take all precautions: avoid sun 10am-4pm'
    ];

    elements.uvValue.textContent = uvIndex;
    elements.uvLevel.textContent = uvLevels[uvIndex];
    elements.uvLevel.className = `uv-level ${uvClasses[uvIndex]}`;
    elements.uvRecommendation.textContent = uvRecommendations[uvIndex];

    elements.airQualityUV.classList.remove('hidden');
}

function displaySunTimes(data) {
    elements.sunrise.textContent = formatTime(data.sys.sunrise);
    elements.sunset.textContent = formatTime(data.sys.sunset);
    elements.dayLength.textContent = calculateDayLength(data.sys.sunrise, data.sys.sunset);

    elements.sunTimes.classList.remove('hidden');
}

// temperature chart using Chart.js
function displayTemperatureChart(data) {
    const ctx = document.getElementById('tempChart').getContext('2d');

    // destroy old chart if exists
    if (temperatureChartInstance) {
        temperatureChartInstance.destroy();
    }

    // get data for chart
    const chartData = data.list.slice(0, 8);
    const labels = chartData.map(item => formatHourTime(item.dt));
    const temperatures = chartData.map(item => formatTemp(item.main.temp));

    temperatureChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Temperature (${getUnitSymbol()})`,
                data: temperatures,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            family: 'Inter',
                            size: 14
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: { family: 'Inter' }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: { family: 'Inter' }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });

    elements.temperatureChart.classList.remove('hidden');
}

// saved locations list
function updateSavedLocationsList() {
    const locations = getSavedLocations();
    elements.savedLocationsList.innerHTML = '';

    if (locations.length === 0) {
        elements.savedLocationsList.innerHTML = '<div class="no-saved-locations">No saved locations yet</div>';
        return;
    }

    locations.forEach(location => {
        const item = document.createElement('div');
        item.className = 'saved-location-item';

        item.innerHTML = `
            <span class="saved-location-name">${location.cityName}, ${location.country}</span>
            <button class="remove-location-btn" data-city="${location.cityName}" data-country="${location.country}">Remove</button>
        `;

        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-location-btn')) {
                elements.savedLocationsModal.classList.add('hidden');
                getWeather('coords', { lat: location.lat, lon: location.lon });
            }
        });

        const removeBtn = item.querySelector('.remove-location-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeLocation(location.cityName, location.country);
        });

        elements.savedLocationsList.appendChild(item);
    });
}

// MAIN WEATHER FUNCTION
async function getWeather(searchType, value) {
    showLoader();

    try {
        let weatherData;

        if (searchType === 'city') {
            weatherData = await fetchWeatherByCity(value);
            lastSearchedCity = value;
        } else if (searchType === 'coords') {
            weatherData = await fetchWeatherByCoords(value.lat, value.lon);
            lastSearchedCity = null;
        }

        // save coordinates for later use
        currentCoordinates = {
            lat: weatherData.coord.lat,
            lon: weatherData.coord.lon,
            city: weatherData.name,
            country: weatherData.sys.country
        };

        // fetch all the data in parallel (faster!)
        const [forecastData, airQualityData] = await Promise.all([
            fetchForecast(weatherData.coord.lat, weatherData.coord.lon),
            fetchAirQuality(weatherData.coord.lat, weatherData.coord.lon)
        ]);

        // display everything
        displayCurrentWeather(weatherData);
        displaySunTimes(weatherData);
        displayHourlyForecast(forecastData);
        displayForecast(forecastData);
        displayAirQuality(airQualityData);
        displayUVIndex(weatherData);
        displayTemperatureChart(forecastData);

    } catch (error) {
        showError(error.message);
    }
}

// EVENT HANDLERS

function handleSearch() {
    const city = elements.cityInput.value.trim();

    if (!city) {
        showError('Please enter a city name.');
        return;
    }

    getWeather('city', city);
}

function handleLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        return;
    }

    showLoader();

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const coords = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            getWeather('coords', coords);
        },
        (error) => {
            let errorMessage = 'Unable to retrieve your location.';

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location access denied. Please enable location permissions.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out.';
                    break;
            }

            showError(errorMessage);
        }
    );
}

function handleSaveLocation() {
    if (currentCoordinates) {
        const saved = saveLocation(
            currentCoordinates.city,
            currentCoordinates.country,
            currentCoordinates.lat,
            currentCoordinates.lon
        );

        if (saved) {
            elements.saveLocationBtn.textContent = '✓ Saved!';
            setTimeout(() => {
                elements.saveLocationBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Save Location
                `;
            }, 2000);
        } else {
            alert('Location already saved!');
        }
    }
}

function handleUnitToggle() {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    elements.unitToggle.textContent = getUnitSymbol();

    // refresh data with new units
    if (lastSearchedCity) {
        getWeather('city', lastSearchedCity);
    } else if (currentCoordinates) {
        getWeather('coords', { lat: currentCoordinates.lat, lon: currentCoordinates.lon });
    }
}

// SETUP EVENT LISTENERS

elements.searchBtn.addEventListener('click', handleSearch);

elements.cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

elements.locationBtn.addEventListener('click', handleLocation);
elements.saveLocationBtn.addEventListener('click', handleSaveLocation);

elements.savedLocationsBtn.addEventListener('click', () => {
    updateSavedLocationsList();
    elements.savedLocationsModal.classList.remove('hidden');
});

elements.closeModal.addEventListener('click', () => {
    elements.savedLocationsModal.classList.add('hidden');
});

elements.savedLocationsModal.addEventListener('click', (e) => {
    if (e.target === elements.savedLocationsModal) {
        elements.savedLocationsModal.classList.add('hidden');
    }
});

elements.unitToggle.addEventListener('click', handleUnitToggle);

// INIT
function init() {
    console.log('Weather app loaded!');
    // could auto-load weather for user location here
    // but let them choose what they want
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// TODO: add weather alerts when available
// TODO: maybe add more chart types?
// TODO: dark/light mode toggle could be nice
