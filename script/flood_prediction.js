// Flood prediction model and calculations
class FloodPredictionModel {
    constructor() {
        // Weights for different factors
        this.weights = {
            rainfall: 0.4,      
            humidity: 0.2,      
            windSpeed: 0.1,     
            pressure: 0.15,     
            cloudCover: 0.15    
        };

        // Thresholds for risk levels (adjusted for more accurate predictions)
        this.thresholds = {
            rainfall: { high: 30, medium: 15 },    // mm (adjusted lower for more sensitivity)
            humidity: { high: 85, medium: 70 },    // %
            windSpeed: { high: 40, medium: 20 },   // km/h
            pressure: { low: 1000, high: 1020 },   // mb
            cloudCover: { high: 80, medium: 50 }   // %
        };
    }

    predictFloodRisk(weatherData) {
        // Calculate individual scores
        const rainfallScore = this.calculateRainfallScore(weatherData.precip_mm);
        const humidityScore = this.calculateHumidityScore(weatherData.humidity);
        const windScore = this.calculateWindScore(weatherData.wind_kph);
        const pressureScore = this.calculatePressureScore(weatherData.pressure_mb);
        const cloudScore = this.calculateCloudScore(weatherData.cloud_cover);

        // Calculate weighted risk percentage
        const riskPercentage = Math.round(
            (rainfallScore * this.weights.rainfall +
            humidityScore * this.weights.humidity +
            windScore * this.weights.windSpeed +
            pressureScore * this.weights.pressure +
            cloudScore * this.weights.cloudCover) * 100
        );

        // Get trend
        const trend = this.calculateTrend(riskPercentage);

        return {
            percentage: riskPercentage,
            trend: trend,
            riskLevel: this.getRiskLevel(riskPercentage)
        };
    }

    calculateRainfallScore(rainfall) {
        if (rainfall >= this.thresholds.rainfall.high) return 1;
        if (rainfall >= this.thresholds.rainfall.medium) return 0.7;
        return Math.min(0.5, (rainfall / this.thresholds.rainfall.medium));
    }

    calculateHumidityScore(humidity) {
        if (humidity >= this.thresholds.humidity.high) return 1;
        if (humidity >= this.thresholds.humidity.medium) return 0.7;
        return humidity / 100;
    }

    calculateWindScore(windSpeed) {
        if (windSpeed >= this.thresholds.windSpeed.high) return 1;
        if (windSpeed >= this.thresholds.windSpeed.medium) return 0.6;
        return windSpeed / this.thresholds.windSpeed.high;
    }

    calculatePressureScore(pressure) {
        if (pressure <= this.thresholds.pressure.low) return 1;
        if (pressure >= this.thresholds.pressure.high) return 0.2;
        return 0.6;
    }

    calculateCloudScore(cloudCover) {
        return cloudCover / 100;
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
} 