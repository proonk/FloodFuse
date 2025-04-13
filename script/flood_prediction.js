// Flood prediction model and calculations
class FloodPredictionModel {
    constructor() {
        // Weights for different factors
        this.weights = {
            rainfall: 0.4,      
            humidity: 0.2,      
            windSpeed: 0.1,     
            pressure: 0.15,     
            cloudCover: 0.15,
            soilMoisture: 0.3,  // New factor
            riverLevel: 0.35,   // New factor
            historicalData: 0.25 // New factor
        };

        // Thresholds for risk levels (adjusted for more accurate predictions)
        this.thresholds = {
            rainfall: { high: 30, medium: 15 },    
            humidity: { high: 85, medium: 70 },    
            windSpeed: { high: 40, medium: 20 },   
            pressure: { low: 1000, high: 1020 },   
            cloudCover: { high: 80, medium: 50 },
            soilMoisture: { high: 85, medium: 65 },
            riverLevel: { high: 3.5, medium: 2.5 }
        };

        // Initialize historical data storage
        this.historicalData = this.loadHistoricalData();
    }

    // Load historical data from localStorage
    loadHistoricalData() {
        const stored = localStorage.getItem('floodHistoricalData');
        return stored ? JSON.parse(stored) : [];
    }

    // Save historical data
    saveHistoricalData(data) {
        this.historicalData.push({
            timestamp: new Date().toISOString(),
            ...data
        });
        // Keep only last 30 days of data
        if (this.historicalData.length > 30) {
            this.historicalData.shift();
        }
        localStorage.setItem('floodHistoricalData', JSON.stringify(this.historicalData));
    }

    predictFloodRisk(weatherData) {
        // Validate and set default values for weather data
        const validatedData = this.validateWeatherData(weatherData);

        // Calculate individual scores with enhanced AI factors
        const rainfallScore = this.calculateRainfallScore(validatedData.precip_mm);
        const humidityScore = this.calculateHumidityScore(validatedData.humidity);
        const windScore = this.calculateWindScore(validatedData.wind_kph);
        const pressureScore = this.calculatePressureScore(validatedData.pressure_mb);
        const cloudScore = this.calculateCloudScore(validatedData.cloud_cover);
        const soilMoistureScore = this.calculateSoilMoistureScore(validatedData.soil_moisture);
        const riverLevelScore = this.calculateRiverLevelScore(validatedData.river_level);
        const historicalScore = this.calculateHistoricalScore(validatedData);

        // Calculate weighted risk percentage with AI-enhanced factors
        const riskPercentage = Math.round(
            (rainfallScore * this.weights.rainfall +
            humidityScore * this.weights.humidity +
            windScore * this.weights.windSpeed +
            pressureScore * this.weights.pressure +
            cloudScore * this.weights.cloudCover +
            soilMoistureScore * this.weights.soilMoisture +
            riverLevelScore * this.weights.riverLevel +
            historicalScore * this.weights.historicalData) * 100
        );

        // Get trend with enhanced prediction
        const trend = this.calculateTrend(riskPercentage);

        // Save prediction data for historical analysis
        this.saveHistoricalData({
            riskPercentage,
            weatherData: validatedData
        });

        return {
            percentage: riskPercentage,
            trend: trend,
            riskLevel: this.getRiskLevel(riskPercentage),
            confidence: this.calculateConfidenceScore(validatedData)
        };
    }

    validateWeatherData(data) {
        // Ensure data is an object
        if (!data || typeof data !== 'object') {
            data = {};
        }

        // Set default values and validate data types
        return {
            precip_mm: this.validateNumber(data.precip_mm, 0),
            humidity: this.validateNumber(data.humidity, 50),
            wind_kph: this.validateNumber(data.wind_kph, 0),
            pressure_mb: this.validateNumber(data.pressure_mb, 1013),
            cloud_cover: this.validateNumber(data.cloud_cover, 0),
            soil_moisture: this.validateNumber(data.soil_moisture, 50),
            river_level: this.validateNumber(data.river_level, 0)
        };
    }

    validateNumber(value, defaultValue) {
        // Convert to number and validate
        const num = Number(value);
        return !isNaN(num) ? num : defaultValue;
    }

    calculateRainfallScore(rainfall) {
        rainfall = this.validateNumber(rainfall, 0);
        if (rainfall >= this.thresholds.rainfall.high) return 1;
        if (rainfall >= this.thresholds.rainfall.medium) return 0.7;
        return Math.min(0.5, (rainfall / this.thresholds.rainfall.medium));
    }

    calculateHumidityScore(humidity) {
        humidity = this.validateNumber(humidity, 50);
        if (humidity >= this.thresholds.humidity.high) return 1;
        if (humidity >= this.thresholds.humidity.medium) return 0.7;
        return humidity / 100;
    }

    calculateWindScore(windSpeed) {
        windSpeed = this.validateNumber(windSpeed, 0);
        if (windSpeed >= this.thresholds.windSpeed.high) return 1;
        if (windSpeed >= this.thresholds.windSpeed.medium) return 0.6;
        return windSpeed / this.thresholds.windSpeed.high;
    }

    calculatePressureScore(pressure) {
        pressure = this.validateNumber(pressure, 1013);
        if (pressure <= this.thresholds.pressure.low) return 1;
        if (pressure >= this.thresholds.pressure.high) return 0.2;
        return 0.6;
    }

    calculateCloudScore(cloudCover) {
        cloudCover = this.validateNumber(cloudCover, 0);
        return cloudCover / 100;
    }

    calculateSoilMoistureScore(moisture) {
        moisture = this.validateNumber(moisture, 50);
        if (moisture >= this.thresholds.soilMoisture.high) return 1;
        if (moisture >= this.thresholds.soilMoisture.medium) return 0.7;
        return moisture / 100;
    }

    calculateRiverLevelScore(level) {
        level = this.validateNumber(level, 0);
        if (level >= this.thresholds.riverLevel.high) return 1;
        if (level >= this.thresholds.riverLevel.medium) return 0.7;
        return level / this.thresholds.riverLevel.high;
    }

    calculateHistoricalScore(currentData) {
        if (this.historicalData.length === 0) return 0.5;

        // Calculate similarity with historical patterns
        const recentData = this.historicalData.slice(-7); // Last 7 days
        const similarPatterns = recentData.filter(historical => 
            Math.abs(historical.riskPercentage - this.predictBaseRisk(currentData)) < 20
        );

        return similarPatterns.length / recentData.length;
    }

    predictBaseRisk(currentData) {
        // Simple baseline prediction based on current conditions
        return (
            (currentData.precip_mm / this.thresholds.rainfall.high) * 0.4 +
            (currentData.humidity / 100) * 0.3 +
            (currentData.river_level / this.thresholds.riverLevel.high) * 0.3
        ) * 100;
    }

    calculateConfidenceScore(weatherData) {
        // Calculate confidence based on data quality and historical patterns
        const dataQuality = this.assessDataQuality(weatherData);
        const historicalConfidence = this.calculateHistoricalConfidence();
        return Math.round((dataQuality + historicalConfidence) / 2);
    }

    assessDataQuality(weatherData) {
        // Check if all critical data points are present and within expected ranges
        const criticalDataPoints = [
            weatherData.precip_mm,
            weatherData.humidity,
            weatherData.river_level
        ];
        
        const validDataPoints = criticalDataPoints.filter(value => 
            value !== undefined && value !== null && !isNaN(value)
        );

        return (validDataPoints.length / criticalDataPoints.length) * 100;
    }

    calculateHistoricalConfidence() {
        if (this.historicalData.length < 7) return 70; // Lower confidence with limited data
        
        const recentPredictions = this.historicalData.slice(-7);
        const accuracy = recentPredictions.reduce((acc, curr, idx) => {
            if (idx === 0) return 100;
            const previous = recentPredictions[idx - 1];
            const error = Math.abs(curr.riskPercentage - previous.riskPercentage);
            return acc - (error > 20 ? 5 : 0);
        }, 100);

        return Math.max(50, Math.min(100, accuracy));
    }

    getRiskLevel(percentage) {
        if (percentage >= 75) return 'high';
        if (percentage >= 50) return 'medium';
        return 'low';
    }

    calculateTrend(currentPercentage) {
        const previousData = JSON.parse(localStorage.getItem('previousRiskData') || '{"percentage": 0}');
        const previousPercentage = previousData.percentage;
        localStorage.setItem('previousRiskData', JSON.stringify({ percentage: currentPercentage }));
        return currentPercentage > previousPercentage ? 'increasing' : 'decreasing';
    }
}

// Create global instance
window.floodModel = new FloodPredictionModel();

// Update the UI with prediction results
function updateFloodRiskUI(prediction) {
    // Update percentage display
    const percentageElement = document.querySelector('.percentage');
    if (percentageElement) {
        percentageElement.textContent = `${prediction.percentage}%`;
    }

    // Update risk indicator
    const riskIndicator = document.querySelector('.risk-indicator');
    if (riskIndicator) {
        riskIndicator.className = `risk-indicator ${prediction.riskLevel}-risk`;
    }

    // Update trend
    const trendElement = document.querySelector('.risk-trend span');
    const trendIcon = document.querySelector('.risk-trend i');
    if (trendElement && trendIcon) {
        trendElement.textContent = prediction.trend;
        trendIcon.className = `fas fa-arrow-${prediction.trend === 'increasing' ? 'up' : 'down'} trend-${prediction.trend}`;
    }

    // Update confidence indicator if it exists
    const confidenceElement = document.querySelector('.confidence-indicator');
    if (confidenceElement) {
        confidenceElement.textContent = `Confidence: ${prediction.confidence}%`;
    }
} 