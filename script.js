document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    let isCollapsed = false;

    // Function to toggle sidebar
    function toggleSidebar() {
        isCollapsed = !isCollapsed;
        sidebar.classList.toggle('collapsed');
    }

    // Add hover effect to sidebar
    sidebar.addEventListener('mouseenter', function() {
        if (isCollapsed) {
            sidebar.classList.remove('collapsed');
        }
    });

    sidebar.addEventListener('mouseleave', function() {
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
    });

    // Handle mobile view
    function handleMobileView() {
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
            isCollapsed = true;
        } else {
            sidebar.classList.remove('collapsed');
            isCollapsed = false;
        }
    }

    // Initial mobile view check
    handleMobileView();

    // Update on window resize
    window.addEventListener('resize', handleMobileView);

    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    const currentPage = window.location.pathname.split('/').pop().split('.')[0];

    navItems.forEach(item => {
        if (item.dataset.page === currentPage) {
            item.classList.add('active');
        }

        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Notification functionality
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationModal = document.getElementById('notificationModal');
    const notificationBadge = document.querySelector('.notification-badge');

    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            notificationModal.style.display = 'block';
        });
    }

    // User profile functionality
    const userProfile = document.getElementById('userProfile');
    const profileModal = document.getElementById('profileModal');

    if (userProfile) {
        userProfile.addEventListener('click', function() {
            profileModal.style.display = 'block';
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // Close modals when clicking close button
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

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

    // Simulate notifications
    const notifications = [
        {
            type: 'warning',
            message: 'River level rising rapidly',
            time: '2h ago'
        },
        {
            type: 'info',
            message: 'Heavy rainfall expected',
            time: '4h ago'
        },
        {
            type: 'alert',
            message: 'High flood risk in North District',
            time: '6h ago'
        }
    ];

    // Update notification badge
    if (notificationBadge) {
        notificationBadge.textContent = notifications.length;
    }

    // Populate notification modal
    const notificationList = document.querySelector('.notification-list');
    if (notificationList) {
        notifications.forEach(notification => {
            const div = document.createElement('div');
            div.className = `notification-item ${notification.type}`;
            div.innerHTML = `
                <i class="fas fa-${notification.type === 'warning' ? 'exclamation-triangle' : 
                                    notification.type === 'alert' ? 'bell' : 'info-circle'}"></i>
                <div class="notification-content">
                    <p>${notification.message}</p>
                    <span class="notification-time">${notification.time}</span>
                </div>
            `;
            notificationList.appendChild(div);
        });
    }

    // Handle profile actions
    const profileActions = document.querySelector('.profile-actions');
    if (profileActions) {
        const buttons = profileActions.querySelectorAll('button');
        buttons[0].addEventListener('click', function() {
            alert('Profile edit functionality would be implemented here');
        });
        buttons[1].addEventListener('click', function() {
            alert('Logout functionality would be implemented here');
        });
    }

    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update risk indicator color based on percentage
    function updateRiskIndicator(percentage) {
        const riskIndicator = document.querySelector('.risk-indicator');
        if (percentage >= 75) {
            riskIndicator.className = 'risk-indicator high-risk';
        } else if (percentage >= 50) {
            riskIndicator.className = 'risk-indicator medium-risk';
        } else {
            riskIndicator.className = 'risk-indicator low-risk';
        }
    }

    // Example: Update risk percentage (this would be replaced with actual data)
    function updateRiskData() {
        // This is just an example - in a real application, this would fetch data from an API
        const percentage = Math.floor(Math.random() * 100);
        document.querySelector('.percentage').textContent = percentage + '%';
        updateRiskIndicator(percentage);
    }

    // Update risk data every 5 minutes (300000 milliseconds)
    setInterval(updateRiskData, 300000);
    // Initial update
    updateRiskData();
}); 