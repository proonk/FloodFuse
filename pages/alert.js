document.addEventListener('DOMContentLoaded', function() {
    // Initialize alert data
    const alertData = {
        activeAlerts: [
            {
                id: 1,
                type: 'high',
                title: 'High Flood Risk - North District',
                time: '2 hours ago',
                description: 'River levels rising rapidly. Expected to exceed flood threshold within 4 hours.',
                metrics: {
                    riverLevel: '2.5m',
                    rainfall: '150mm',
                    riskLevel: 'High'
                }
            },
            {
                id: 2,
                type: 'medium',
                title: 'Heavy Rainfall Warning',
                time: '4 hours ago',
                description: 'Heavy rainfall expected in the next 12 hours. Monitor river levels closely.',
                metrics: {
                    expectedRainfall: '80mm',
                    duration: '12h',
                    riskLevel: 'Medium'
                }
            }
        ],
        history: [
            {
                id: 1,
                type: 'resolved',
                title: 'Flood Warning Resolved',
                description: 'River levels returned to normal in South District',
                time: 'Yesterday, 3:45 PM'
            },
            {
                id: 2,
                type: 'alert',
                title: 'Soil Saturation Alert',
                description: 'High soil moisture levels detected in West Region',
                time: '2 days ago, 10:30 AM'
            },
            {
                id: 3,
                type: 'info',
                title: 'System Maintenance',
                description: 'Scheduled maintenance completed successfully',
                time: '3 days ago, 8:00 AM'
            }
        ]
    };

    // Update last updated time
    function updateLastUpdated() {
        const lastUpdate = document.getElementById('lastUpdate');
        if (lastUpdate) {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            lastUpdate.textContent = timeString;
        }
    }

    // Update time every minute
    setInterval(updateLastUpdated, 60000);
    updateLastUpdated();

    // Filter functionality
    const filterSelects = document.querySelectorAll('.filter-select');
    const filterBtn = document.querySelector('.filter-btn');

    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            const filters = {
                type: document.querySelector('select[value="all"]').value,
                timeRange: document.querySelector('select[value="24h"]').value,
                severity: document.querySelector('select[value="all"]').value
            };
            console.log('Applying filters:', filters);
            // Here you would typically make an API call with the filters
        });
    }

    // Create new alert
    const createAlertBtn = document.querySelector('.btn.secondary');
    if (createAlertBtn) {
        createAlertBtn.addEventListener('click', function() {
            // Here you would typically open a modal or navigate to a form
            console.log('Create new alert clicked');
        });
    }

    // Share alert functionality
    const shareButtons = document.querySelectorAll('.btn.primary');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: 'Flood Alert',
                    text: 'Check this important flood alert',
                    url: window.location.href
                })
                .catch(error => console.log('Error sharing:', error));
            } else {
                // Fallback for browsers that don't support Web Share API
                alert('Share functionality is not supported in this browser.');
            }
        });
    });

    // Download report functionality
    const downloadButtons = document.querySelectorAll('.btn.secondary');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const alertCard = this.closest('.alert-card');
            const alertData = {
                title: alertCard.querySelector('h3').textContent,
                time: alertCard.querySelector('.alert-time').textContent,
                description: alertCard.querySelector('p').textContent,
                metrics: Array.from(alertCard.querySelectorAll('.metric')).map(metric => ({
                    label: metric.querySelector('.label').textContent,
                    value: metric.querySelector('.value').textContent
                }))
            };

            const jsonString = JSON.stringify(alertData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'flood-alert-report.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });

    // Pagination functionality
    const paginationButtons = document.querySelectorAll('.pagination button');
    paginationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentPage = document.querySelector('.page-info');
            if (currentPage) {
                const currentPageNum = parseInt(currentPage.textContent.split(' ')[1]);
                const totalPages = parseInt(currentPage.textContent.split(' ')[3]);
                let newPage = currentPageNum;

                if (this.querySelector('.fa-chevron-left')) {
                    newPage = Math.max(1, currentPageNum - 1);
                } else if (this.querySelector('.fa-chevron-right')) {
                    newPage = Math.min(totalPages, currentPageNum + 1);
                }

                currentPage.textContent = `Page ${newPage} of ${totalPages}`;
                // Here you would typically load the new page data
            }
        });
    });

    // Simulate real-time updates
    function simulateUpdates() {
        const alertCards = document.querySelectorAll('.alert-card');
        alertCards.forEach(card => {
            const metrics = card.querySelectorAll('.metric .value');
            metrics.forEach(metric => {
                const currentValue = parseFloat(metric.textContent);
                const randomChange = (Math.random() - 0.5) * 0.1;
                const newValue = Math.max(0, currentValue + randomChange);
                metric.textContent = newValue.toFixed(1) + (metric.textContent.includes('m') ? 'm' : 'mm');
            });
        });
    }

    // Update metrics every 5 minutes
    setInterval(simulateUpdates, 300000);
}); 