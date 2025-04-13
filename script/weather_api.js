// WeatherAPI.com configuration
const API_KEY = 'effc3767b1684ea18bf00054251304';
const BASE_URL = 'https://api.weatherapi.com/v1';

// Cities in Sarawak to monitor
const cities = [
    { name: 'Kuching,Sarawak', country: 'MY', value: 'kuching' },
    { name: 'Sibu,Sarawak', country: 'MY', value: 'sibu' },
    { name: 'Miri,Sarawak', country: 'MY', value: 'miri' },
    { name: 'Bintulu,Sarawak', country: 'MY', value: 'bintulu' }
];

async function getCurrentWeatherData(city) {
    try {
        const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${city.name}&aqi=yes`);
        const data = await response.json();
        
        if (response.ok) {
            return {
                city: city.name.split(',')[0],
                value: city.value,
                timestamp: new Date().toISOString(),
                temperature_c: data.current.temp_c,
                humidity: data.current.humidity,
                wind_kph: data.current.wind_kph,
                wind_degree: data.current.wind_degree,
                wind_direction: data.current.wind_dir,
                pressure_mb: data.current.pressure_mb,
                precip_mm: data.current.precip_mm,
                cloud_cover: data.current.cloud,
                feels_like_c: data.current.feelslike_c,
                vis_km: data.current.vis_km,
                uv: data.current.uv,
                gust_kph: data.current.gust_kph
            };
        } else {
            throw new Error(`Error fetching data for ${city.name}`);
        }
    } catch (error) {
        console.error(`Failed to fetch weather for ${city.name}:`, error);
        return null;
    }
}

function updateUI(weatherData, selectedCity) {
    const cityData = weatherData.current_conditions.find(data => data.value === selectedCity);
    
    if (cityData) {
        // Get flood risk prediction
        const prediction = window.floodModel.predictFloodRisk(cityData);
        
        // Update percentage and risk indicator
        const percentageElement = document.querySelector('.percentage');
        const riskIndicator = document.querySelector('.risk-indicator');
        if (percentageElement && riskIndicator) {
            percentageElement.textContent = `${prediction.percentage}%`;
            riskIndicator.className = `risk-indicator ${prediction.riskLevel}-risk`;
        }

        // Update trend
        const trendElement = document.querySelector('.risk-trend span');
        const trendIcon = document.querySelector('.risk-trend i');
        if (trendElement && trendIcon) {
            trendElement.textContent = prediction.trend;
            trendIcon.className = `fas fa-arrow-${prediction.trend === 'increasing' ? 'up' : 'down'} trend-${prediction.trend}`;
        }

        // Update description
        const description = document.querySelector('.risk-description p');
        if (description) {
            const riskText = prediction.riskLevel === 'high' ? 
                'High risk of flooding in the next 24 hours. Take necessary precautions.' :
                prediction.riskLevel === 'medium' ?
                'Medium risk of flooding. Monitor the situation closely.' :
                'Low risk of flooding. Normal conditions expected.';
            description.textContent = riskText;
        }

        // Update weather info
        const weatherContainer = document.querySelector('.river-info');
        if (weatherContainer) {
            weatherContainer.innerHTML = `
                <div class="info-item">
                    <div class="info-icon">
                        <i class="fas fa-cloud-rain"></i>
                    </div>
                    <div class="info-content">
                        <span class="label">Rainfall</span>
                        <span class="value">${cityData.precip_mm}mm</span>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-icon">
                        <i class="fas fa-water"></i>
                    </div>
                    <div class="info-content">
                        <span class="label">Humidity</span>
                        <span class="value">${cityData.humidity}%</span>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-icon">
                        <i class="fas fa-wind"></i>
                    </div>
                    <div class="info-content">
                        <span class="label">Wind</span>
                        <span class="value">${cityData.wind_kph} km/h</span>
                    </div>
                </div>
            `;
        }

        // Update weather forecast
        updateWeatherForecast(weatherData, selectedCity);

        // Update recent alerts
        updateRecentAlerts(weatherData, selectedCity);

        // Update map
        updateFloodMap(selectedCity);
    }
}

async function updateWeatherData() {
    const selectedCity = document.getElementById('areaSelect').value;
    
    // Collect current conditions for all cities
    const currentConditions = await Promise.all(
        cities.map(city => getCurrentWeatherData(city))
    );

    const weatherData = {
        timestamp: new Date().toISOString(),
        current_conditions: currentConditions.filter(data => data !== null)
    };

    // Update UI
    updateUI(weatherData, selectedCity);

    return weatherData;
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initial update
    updateWeatherData();

    // Add event listener for city selection change
    const areaSelect = document.getElementById('areaSelect');
    if (areaSelect) {
        areaSelect.addEventListener('change', updateWeatherData);
    }

    // Update every 5 minutes
    setInterval(updateWeatherData, 5 * 60 * 1000);

    // Add Leaflet CSS
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(leafletCSS);

    // Add Leaflet JS
    const leafletScript = document.createElement('script');
    leafletScript.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    document.head.appendChild(leafletScript);
}); 
// Function to fetch forecast data for a single city
async function getForecastData(city) {
    try {
        const response = await fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${city.name}&days=3&aqi=yes`);
        const data = await response.json();
        
        if (response.ok) {
            return {
                city: city.name.split(',')[0],
                value: city.value,
                timestamp: new Date().toISOString(),
                forecast: data.forecast.forecastday.map(day => ({
                    date: day.date,
                    max_temp_c: day.day.maxtemp_c,
                    min_temp_c: day.day.mintemp_c,
                    avg_temp_c: day.day.avgtemp_c,
                    max_wind_kph: day.day.maxwind_kph,
                    total_precip_mm: day.day.totalprecip_mm,
                    avg_humidity: day.day.avghumidity,
                    daily_chance_of_rain: day.day.daily_chance_of_rain,
                    condition: day.day.condition.text
                }))
            };
        } else {
            throw new Error(`Error fetching forecast for ${city.name}: ${data.error.message}`);
        }
    } catch (error) {
        console.error(`Failed to fetch forecast for ${city.name}:`, error);
        return null;
    }
}

// Function to update the UI with weather data
function updateWeatherUI(weatherData, selectedCity) {
    const weatherContainer = document.querySelector('.river-info');
    if (!weatherContainer) return;

    // Clear existing weather information
    weatherContainer.innerHTML = '';

    // Filter data for selected city
    const cityData = weatherData.current_conditions.find(data => data.value === selectedCity);
    
    if (cityData) {
        // Get flood risk prediction
        const prediction = floodModel.predictFloodRisk(cityData);
        
        // Update UI with prediction
        updateFloodRiskUI(prediction);

        // Display weather information
        weatherContainer.innerHTML = `
            <div class="info-item">
                <div class="info-icon">
                    <i class="fas fa-thermometer-half"></i>
                </div>
                <div class="info-content">
                    <span class="label">Temperature</span>
                    <span class="value">${cityData.temperature_c}°C</span>
                </div>
            </div>
            <div class="info-item">
                <div class="info-icon">
                    <i class="fas fa-cloud-rain"></i>
                </div>
                <div class="info-content">
                    <span class="label">Rainfall</span>
                    <span class="value">${cityData.precip_mm}mm</span>
                </div>
            </div>
            <div class="info-item">
                <div class="info-icon">
                    <i class="fas fa-wind"></i>
                </div>
                <div class="info-content">
                    <span class="label">Wind</span>
                    <span class="value">${cityData.wind_kph} km/h ${cityData.wind_direction}</span>
                </div>
            </div>
        `;

        // Update risk description
        const description = document.querySelector('.risk-description p');
        if (description) {
            description.textContent = `${prediction.riskLevel.charAt(0).toUpperCase() + prediction.riskLevel.slice(1)} risk of flooding. Current rainfall: ${cityData.precip_mm}mm, Humidity: ${cityData.humidity}%`;
        }
    }
}

// Function to update risk description based on weather conditions
function updateRiskDescription(currentData, forecastData) {
    const description = document.querySelector('.risk-description p');
    if (!description) return;

    let riskLevel = 'Low';
    let riskPercentage = 0;

    // Calculate risk based on current conditions and forecast
    if (currentData.precip_mm > 50 || currentData.humidity > 85) {
        riskLevel = 'High';
        riskPercentage = 75;
    } else if (currentData.precip_mm > 25 || currentData.humidity > 70) {
        riskLevel = 'Medium';
        riskPercentage = 50;
    }

    // Update risk indicator
    const percentageElement = document.querySelector('.percentage');
    const riskIndicator = document.querySelector('.risk-indicator');
    if (percentageElement && riskIndicator) {
        percentageElement.textContent = `${riskPercentage}%`;
        riskIndicator.className = `risk-indicator ${riskLevel.toLowerCase()}-risk`;
    }

    // Update description
    description.textContent = `${riskLevel} risk of flooding. Current rainfall: ${currentData.precip_mm}mm, Humidity: ${currentData.humidity}%`;
}

// Function to collect and display weather data
async function updateWeatherData() {
    // Get selected city
    const selectedCity = document.getElementById('areaSelect').value;

    // Collect current conditions for all cities
    const currentConditions = await Promise.all(
        cities.map(city => getCurrentWeatherData(city))
    );

    // Collect forecast data for all cities
    const forecasts = await Promise.all(
        cities.map(city => getForecastData(city))
    );

    const weatherData = {
        timestamp: new Date().toISOString(),
        current_conditions: currentConditions.filter(data => data !== null),
        forecasts: forecasts.filter(data => data !== null)
    };

    // Update the UI with new weather data for selected city
    updateWeatherUI(weatherData, selectedCity);

    // Store the data for AI training
    storeWeatherData(weatherData);

    return weatherData;
}

// Function to store weather data for AI training
function storeWeatherData(weatherData) {
    // Get existing data from localStorage or initialize new array
    const storedData = JSON.parse(localStorage.getItem('weatherData') || '[]');
    
    // Add new data
    storedData.push(weatherData);
    
    // Keep only last 1000 entries to manage storage space
    if (storedData.length > 1000) {
        storedData.shift(); // Remove oldest entry
    }
    
    // Save back to localStorage
    localStorage.setItem('weatherData', JSON.stringify(storedData));
}

// Function to download collected data as CSV
function downloadWeatherData() {
    const storedData = JSON.parse(localStorage.getItem('weatherData') || '[]');
    
    if (storedData.length === 0) {
        alert('No weather data available to download');
        return;
    }

    // Create CSV content
    const headers = [
        'timestamp',
        'city',
        'temperature_c',
        'humidity',
        'wind_kph',
        'pressure_mb',
        'precip_mm',
        'cloud_cover',
        'uv',
        'gust_kph'
    ].join(',');

    const rows = storedData.flatMap(data => 
        data.current_conditions.map(city => [
            data.timestamp,
            city.city,
            city.temperature_c,
            city.humidity,
            city.wind_kph,
            city.pressure_mb,
            city.precip_mm,
            city.cloud_cover,
            city.uv,
            city.gust_kph
        ].join(','))
    );

    const csv = [headers, ...rows].join('\n');

    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `weather_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Initialize weather data collection
document.addEventListener('DOMContentLoaded', function() {
    // Initial update
    updateWeatherData();

    // Add event listener for city selection change
    const areaSelect = document.getElementById('areaSelect');
    if (areaSelect) {
        areaSelect.addEventListener('change', updateWeatherData);
    }

    // Update every 30 minutes
    setInterval(updateWeatherData, 30 * 60 * 1000);

    // Add download button to the UI
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
        const downloadButton = document.createElement('button');
        downloadButton.className = 'btn secondary';
        downloadButton.innerHTML = '<i class="fas fa-download"></i> Download Weather Data';
        downloadButton.onclick = downloadWeatherData;
        actionButtons.appendChild(downloadButton);
    }
});

function updateWeatherForecast(weatherData, selectedCity) {
    const forecastContainer = document.querySelector('.weather-items');
    if (!forecastContainer) return;

    // Get the forecast data for the selected city
    getForecastData({ name: `${selectedCity},Sarawak`, country: 'MY', value: selectedCity })
        .then(forecast => {
            if (forecast && forecast.forecast && forecast.forecast.length >= 2) {
                const today = forecast.forecast[0];
                const tomorrow = forecast.forecast[1];

                // Get current conditions for more accurate "today" temperature
                const currentData = weatherData.current_conditions.find(data => data.value === selectedCity);
                const currentTemp = currentData ? currentData.temperature_c : today.avg_temp_c;

                forecastContainer.innerHTML = `
                    <div class="weather-item">
                        <i class="${getWeatherIcon(today.condition)}"></i>
                        <span>Today</span>
                        <span class="temp">${Math.round(currentTemp)}°C</span>
                    </div>
                    <div class="weather-item">
                        <i class="${getWeatherIcon(tomorrow.condition)}"></i>
                        <span>Tomorrow</span>
                        <span class="temp">${Math.round(tomorrow.avg_temp_c)}°C</span>
                    </div>
                `;

                // Update last update time
                const lastUpdateElement = document.getElementById('lastUpdate');
                if (lastUpdateElement) {
                    const now = new Date();
                    lastUpdateElement.textContent = now.toLocaleTimeString();
                }
            } else {
                console.error('Forecast data is incomplete');
            }
        })
        .catch(error => {
            console.error('Error updating forecast:', error);
            // Show error state in the UI
            forecastContainer.innerHTML = `
                <div class="weather-item">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Today</span>
                    <span class="temp">--°C</span>
                </div>
                <div class="weather-item">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Tomorrow</span>
                    <span class="temp">--°C</span>
                </div>
            `;
        });
}

function getWeatherIcon(condition) {
    const iconMap = {
        'Sunny': 'fas fa-sun',
        'Clear': 'fas fa-sun',
        'Partly cloudy': 'fas fa-cloud-sun',
        'Cloudy': 'fas fa-cloud',
        'Overcast': 'fas fa-cloud',
        'Mist': 'fas fa-smog',
        'Patchy rain possible': 'fas fa-cloud-rain',
        'Patchy snow possible': 'fas fa-snowflake',
        'Patchy sleet possible': 'fas fa-cloud-rain',
        'Patchy freezing drizzle possible': 'fas fa-cloud-rain',
        'Thundery outbreaks possible': 'fas fa-bolt',
        'Blowing snow': 'fas fa-wind',
        'Blizzard': 'fas fa-snowflake',
        'Fog': 'fas fa-smog',
        'Freezing fog': 'fas fa-smog',
        'Patchy light drizzle': 'fas fa-cloud-rain',
        'Light drizzle': 'fas fa-cloud-rain',
        'Freezing drizzle': 'fas fa-cloud-rain',
        'Heavy freezing drizzle': 'fas fa-cloud-showers-heavy',
        'Patchy light rain': 'fas fa-cloud-rain',
        'Light rain': 'fas fa-cloud-rain',
        'Moderate rain at times': 'fas fa-cloud-rain',
        'Moderate rain': 'fas fa-cloud-rain',
        'Heavy rain at times': 'fas fa-cloud-showers-heavy',
        'Heavy rain': 'fas fa-cloud-showers-heavy',
        'Light freezing rain': 'fas fa-cloud-rain',
        'Moderate or heavy freezing rain': 'fas fa-cloud-showers-heavy',
        'Light sleet': 'fas fa-cloud-rain',
        'Moderate or heavy sleet': 'fas fa-cloud-showers-heavy',
        'Patchy light snow': 'fas fa-snowflake',
        'Light snow': 'fas fa-snowflake',
        'Patchy moderate snow': 'fas fa-snowflake',
        'Moderate snow': 'fas fa-snowflake',
        'Patchy heavy snow': 'fas fa-snowflake',
        'Heavy snow': 'fas fa-snowflake',
        'Ice pellets': 'fas fa-icicles',
        'Light rain shower': 'fas fa-cloud-rain',
        'Moderate or heavy rain shower': 'fas fa-cloud-showers-heavy',
        'Torrential rain shower': 'fas fa-cloud-showers-heavy',
        'Light sleet showers': 'fas fa-cloud-rain',
        'Moderate or heavy sleet showers': 'fas fa-cloud-showers-heavy',
        'Light snow showers': 'fas fa-snowflake',
        'Moderate or heavy snow showers': 'fas fa-snowflake',
        'Light showers of ice pellets': 'fas fa-icicles',
        'Moderate or heavy showers of ice pellets': 'fas fa-icicles',
        'Patchy light rain with thunder': 'fas fa-bolt',
        'Moderate or heavy rain with thunder': 'fas fa-bolt',
        'Patchy light snow with thunder': 'fas fa-bolt',
        'Moderate or heavy snow with thunder': 'fas fa-bolt',
        'default': 'fas fa-cloud'
    };

    return iconMap[condition] || iconMap.default;
}

// Function to manage recent alerts
function updateRecentAlerts(weatherData, selectedCity) {
    const alertsContainer = document.querySelector('.alert-items');
    if (!alertsContainer) return;

    const cityData = weatherData.current_conditions.find(data => data.value === selectedCity);
    if (!cityData) return;

    const alerts = [];
    const currentTime = new Date();

    // Check for river level alert based on rainfall and humidity
    if (cityData.precip_mm > 25 || cityData.humidity > 85) {
        alerts.push({
            type: 'warning',
            message: `River level rising rapidly in ${cityData.city}`,
            icon: 'fas fa-exclamation-triangle',
            time: new Date(currentTime - 2 * 60 * 60 * 1000) // 2 hours ago
        });
    }

    // Check for rainfall alert
    if (cityData.precip_mm > 15) {
        alerts.push({
            type: 'info',
            message: `Heavy rainfall expected in ${cityData.city} (${cityData.precip_mm}mm)`,
            icon: 'fas fa-info-circle',
            time: new Date(currentTime - 4 * 60 * 60 * 1000) // 4 hours ago
        });
    }

    // Add wind alert if wind speed is high
    if (cityData.wind_kph > 30) {
        alerts.push({
            type: 'warning',
            message: `Strong winds in ${cityData.city} (${cityData.wind_kph} km/h)`,
            icon: 'fas fa-wind',
            time: new Date(currentTime - 1 * 60 * 60 * 1000) // 1 hour ago
        });
    }

    // Update alerts UI
    alertsContainer.innerHTML = alerts.map(alert => `
        <div class="alert-item">
            <i class="${alert.icon}"></i>
            <span>${alert.message}</span>
            <span class="alert-time">${formatTimeAgo(alert.time)}</span>
        </div>
    `).join('');

    // If no alerts, show a default message
    if (alerts.length === 0) {
        alertsContainer.innerHTML = `
            <div class="alert-item">
                <i class="fas fa-check-circle"></i>
                <span>No current alerts for ${cityData.city}</span>
                <span class="alert-time">Just now</span>
            </div>
        `;
    }
}

// Helper function to format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    return `${diffInHours}h ago`;
}

// Function to initialize and update the flood risk map
function updateFloodMap(selectedCity) {
    const mapContainer = document.querySelector('.map-placeholder');
    if (!mapContainer) return;

    // Initialize the map if it hasn't been initialized yet
    if (!window.floodMap) {
        // Initialize Leaflet map
        window.floodMap = L.map(mapContainer).setView([2.3, 111.8], 12);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(window.floodMap);

        // Initialize layer groups for risk zones
        window.riskLayers = {
            high: L.layerGroup(),
            medium: L.layerGroup(),
            low: L.layerGroup()
        };

        // Add layer groups to map
        Object.values(window.riskLayers).forEach(layer => layer.addTo(window.floodMap));
    }

    // Clear existing layers
    Object.values(window.riskLayers).forEach(layer => layer.clearLayers());

    // City-specific flood risk data
    const cityData = {
        'sibu': {
            center: [2.3, 111.8],
            zoom: 13,
            riskZones: [
                {
                    name: 'Sibu Town Center',
                    coords: [
                        [2.3027, 111.8425],
                        [2.3127, 111.8525],
                        [2.2927, 111.8525]
                    ],
                    risk: 'high',
                    details: 'Historical flooding area near Rajang River'
                },
                {
                    name: 'Sungai Merah',
                    coords: [
                        [2.2827, 111.8225],
                        [2.2927, 111.8325],
                        [2.2727, 111.8325]
                    ],
                    risk: 'medium',
                    details: 'Moderate risk during heavy rainfall'
                },
                {
                    name: 'Sibu Jaya',
                    coords: [
                        [2.3227, 111.8625],
                        [2.3327, 111.8725],
                        [2.3127, 111.8725]
                    ],
                    risk: 'low',
                    details: 'Well-drained area with good flood control'
                }
            ],
            riverPoints: [
                { coords: [2.3027, 111.8425], name: 'Rajang River Monitor Point 1' },
                { coords: [2.2927, 111.8325], name: 'Igan River Monitor Point' }
            ]
        },
        'kuching': {
            center: [1.55, 110.35],
            zoom: 13,
            riskZones: [
                {
                    name: 'Kuching City Center',
                    coords: [
                        [1.5527, 110.3425],
                        [1.5627, 110.3525],
                        [1.5427, 110.3525]
                    ],
                    risk: 'high',
                    details: 'Prone to flooding during monsoon'
                }
            ],
            riverPoints: [
                { coords: [1.5527, 110.3425], name: 'Sarawak River Monitor Point' }
            ]
        },
        'miri': {
            center: [4.4, 114.0],
            zoom: 13,
            riskZones: [
                {
                    name: 'Miri City Center',
                    coords: [
                        [4.4027, 114.0425],
                        [4.4127, 114.0525],
                        [4.3927, 114.0525]
                    ],
                    risk: 'medium',
                    details: 'Moderate flood risk area'
                }
            ],
            riverPoints: [
                { coords: [4.4027, 114.0425], name: 'Miri River Monitor Point' }
            ]
        },
        'bintulu': {
            center: [3.2, 113.1],
            zoom: 13,
            riskZones: [
                {
                    name: 'Bintulu Town',
                    coords: [
                        [3.2027, 113.1425],
                        [3.2127, 113.1525],
                        [3.1927, 113.1525]
                    ],
                    risk: 'medium',
                    details: 'Moderate risk during heavy rain'
                }
            ],
            riverPoints: [
                { coords: [3.2027, 113.1425], name: 'Kemena River Monitor Point' }
            ]
        }
    };

    // Get selected city data
    const city = cityData[selectedCity];
    if (!city) return;

    // Update map view to selected city
    window.floodMap.setView(city.center, city.zoom);

    // Style configurations
    const riskStyles = {
        high: {
            color: '#ff4d4d',
            fillColor: '#ff4d4d',
            fillOpacity: 0.5,
            weight: 2
        },
        medium: {
            color: '#ffc107',
            fillColor: '#ffc107',
            fillOpacity: 0.4,
            weight: 2
        },
        low: {
            color: '#28a745',
            fillColor: '#28a745',
            fillOpacity: 0.3,
            weight: 2
        }
    };

    // Add risk zones for selected city
    city.riskZones.forEach(zone => {
        const polygon = L.polygon(zone.coords, riskStyles[zone.risk])
            .addTo(window.riskLayers[zone.risk]);

        // Add interactive popup
        polygon.bindPopup(`
            <div class="map-popup">
                <h4>${zone.name}</h4>
                <p><strong>Risk Level:</strong> ${zone.risk.toUpperCase()}</p>
                <p>${zone.details}</p>
            </div>
        `);

        // Add hover effect
        polygon.on('mouseover', function() {
            this.setStyle({ fillOpacity: 0.7 });
        }).on('mouseout', function() {
            this.setStyle({ fillOpacity: riskStyles[zone.risk].fillOpacity });
        });
    });

    // Add river monitoring points
    city.riverPoints.forEach(point => {
        const marker = L.marker(point.coords, {
            icon: L.divIcon({
                className: 'river-monitor-point',
                html: '<i class="fas fa-water"></i>',
                iconSize: [20, 20]
            })
        }).addTo(window.floodMap);

        marker.bindPopup(`
            <div class="map-popup">
                <h4>${point.name}</h4>
                <p>Monitoring water levels and flow rate</p>
            </div>
        `);
    });

    // Update layers control
    if (window.layersControl) {
        window.floodMap.removeControl(window.layersControl);
    }

    window.layersControl = L.control.layers({}, {
        'High Risk Areas': window.riskLayers.high,
        'Medium Risk Areas': window.riskLayers.medium,
        'Low Risk Areas': window.riskLayers.low
    }, { collapsed: false }).addTo(window.floodMap);

    // Add scale control
    if (!window.scaleControl) {
        window.scaleControl = L.control.scale().addTo(window.floodMap);
    }
} 