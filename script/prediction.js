document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let riskData = {
        percentage: 75,
        trend: 'increasing',
        riverLevel: 2.5,
        rainfall: 150,
        soilMoisture: 85
    };

    // Update risk data every 5 minutes
    setInterval(updateRiskData, 300000);
    updateRiskData();

    // Modal functionality
    const modals = {
        layers: document.getElementById('layersModal'),
        search: document.getElementById('searchModal')
    };

    // Button event listeners
    document.getElementById('toggleLayers').addEventListener('click', () => toggleModal('layers'));
    document.getElementById('searchLocation').addEventListener('click', () => toggleModal('search'));
    document.getElementById('downloadReport').addEventListener('click', downloadReport);
    document.getElementById('shareAlert').addEventListener('click', shareAlert);

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // Close modal when clicking close button
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    // Function to update risk data
    function updateRiskData() {
        // Simulate data changes
        riskData.percentage = Math.min(100, Math.max(0, riskData.percentage + (Math.random() * 10 - 5)));
        riskData.riverLevel = (2.5 + Math.random() * 0.5).toFixed(1);
        riskData.rainfall = Math.floor(150 + Math.random() * 50);
        riskData.soilMoisture = Math.floor(85 + Math.random() * 10);

        // Update UI
        document.querySelector('.percentage').textContent = Math.round(riskData.percentage) + '%';
        document.querySelector('.risk-indicator').className = 'risk-indicator ' + getRiskClass(riskData.percentage);
        document.querySelector('.value:nth-child(1)').textContent = riskData.riverLevel + 'm';
        document.querySelector('.value:nth-child(2)').textContent = riskData.rainfall + 'mm';
        document.querySelector('.value:nth-child(3)').textContent = riskData.soilMoisture + '%';

        // Update risk description
        updateRiskDescription(riskData.percentage);
    }

    // Function to get risk class based on percentage
    function getRiskClass(percentage) {
        if (percentage >= 75) return 'high-risk';
        if (percentage >= 50) return 'medium-risk';
        return 'low-risk';
    }

    // Function to update risk description
    function updateRiskDescription(percentage) {
        const description = document.querySelector('.risk-description p');
        if (percentage >= 75) {
            description.textContent = 'High risk of flooding in the next 24 hours. Take necessary precautions.';
        } else if (percentage >= 50) {
            description.textContent = 'Moderate risk of flooding. Monitor the situation closely.';
        } else {
            description.textContent = 'Low risk of flooding. Normal conditions expected.';
        }
    }

    // Function to toggle modal
    function toggleModal(modalName) {
        const modal = modals[modalName];
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    }

    // Function to download report
    function downloadReport() {
        // Create report content
        const report = {
            timestamp: new Date().toISOString(),
            riskPercentage: riskData.percentage,
            riverLevel: riskData.riverLevel,
            rainfall: riskData.rainfall,
            soilMoisture: riskData.soilMoisture
        };

        // Convert to JSON and create download
        const dataStr = JSON.stringify(report, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `flood-report-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Function to share alert
    function shareAlert() {
        const alertText = `Flood Alert: Current risk level is ${Math.round(riskData.percentage)}%. River level: ${riskData.riverLevel}m, Rainfall: ${riskData.rainfall}mm.`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Flood Alert',
                text: alertText
            }).catch(console.error);
        } else {
            // Fallback for browsers that don't support Web Share API
            alert('Share functionality is not supported in this browser. Alert text: ' + alertText);
        }
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.querySelector('.search-results');

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        // Simulate search results
        const locations = [
            'Main River',
            'North District',
            'South District',
            'East River',
            'West River',
            'Central Area'
        ];

        const results = locations.filter(location => 
            location.toLowerCase().includes(query)
        );

        displaySearchResults(results);
    });

    function displaySearchResults(results) {
        searchResults.innerHTML = '';
        results.forEach(result => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.textContent = result;
            div.addEventListener('click', () => {
                // Simulate selecting a location
                alert(`Selected location: ${result}`);
                document.getElementById('searchModal').style.display = 'none';
            });
            searchResults.appendChild(div);
        });
    }

    // Layer controls
    const layerOptions = document.querySelectorAll('.layer-option input');
    layerOptions.forEach(option => {
        option.addEventListener('change', function() {
            const layerName = this.nextElementSibling.textContent;
            console.log(`${layerName} layer ${this.checked ? 'enabled' : 'disabled'}`);
            // Here you would typically update the map layers
        });
    });
}); 