// Initialize the map when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create the map centered on Sarawak, Malaysia
    const map = L.map('map').setView([2.5, 113.5], 7);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add markers for major cities in Sarawak
    const cities = [
        { name: 'Kuching', coords: [1.5497, 110.3409] },
        { name: 'Sibu', coords: [2.3, 111.8] },
        { name: 'Miri', coords: [4.3995, 113.9914] },
        { name: 'Bintulu', coords: [3.1714, 113.0419] }
    ];

    // Add markers to the map
    cities.forEach(city => {
        L.marker(city.coords)
            .bindPopup(`<b>${city.name}</b><br>Click for flood monitoring data`)
            .addTo(map);
    });
}); 