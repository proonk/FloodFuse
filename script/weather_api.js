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