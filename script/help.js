document.addEventListener('DOMContentLoaded', () => {
    // Update last updated time
    const lastUpdated = document.querySelector('.last-updated');
    if (lastUpdated) {
        const now = new Date();
        lastUpdated.textContent = `Last updated: ${now.toLocaleString()}`;
    }

    // FAQ Functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other open FAQs
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        });
    });

    // Help Search Functionality
    const searchInput = document.querySelector('.help-search input');
    const searchBtn = document.querySelector('.search-btn');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const helpContent = document.querySelectorAll('.faq-item, .tutorial-card, .guide-card');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';

        helpContent.forEach(item => {
            const text = item.textContent.toLowerCase();
            const category = item.dataset.category;
            const matchesSearch = text.includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || category === activeCategory;

            item.style.display = matchesSearch && matchesCategory ? '' : 'none';
        });
    }

    searchInput.addEventListener('input', performSearch);
    searchBtn.addEventListener('click', performSearch);

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(otherBtn => otherBtn.classList.remove('active'));
            btn.classList.add('active');
            performSearch();
        });
    });

    // Live Chat Modal Functionality
    const chatModal = document.getElementById('chatModal');
    const openChatBtn = document.querySelector('.chat .support-content button');
    const closeChatBtn = document.querySelector('.chat-modal .close-btn');
    const chatInput = document.querySelector('.chat-input textarea');
    const sendMessageBtn = document.querySelector('.chat-input button');
    const chatMessages = document.querySelector('.chat-messages');

    function openChatModal() {
        chatModal.style.display = 'block';
        setTimeout(() => chatModal.classList.add('active'), 10);
        chatInput.focus();
    }

    function closeChatModal() {
        chatModal.classList.remove('active');
        setTimeout(() => chatModal.style.display = 'none', 300);
    }

    function addMessage(message, isUser = true) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', isUser ? 'user-message' : 'support-message');
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function handleSendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message);
            chatInput.value = '';

            // Simulate support response after a delay
            setTimeout(() => {
                addMessage('Thank you for your message. A support representative will respond shortly.', false);
            }, 1000);
        }
    }

    openChatBtn?.addEventListener('click', openChatModal);
    closeChatBtn?.addEventListener('click', closeChatModal);
    sendMessageBtn?.addEventListener('click', handleSendMessage);

    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === chatModal) {
            closeChatModal();
        }
    });

    // Tutorial Video Functionality
    const tutorialCards = document.querySelectorAll('.tutorial-card');
    tutorialCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.dataset.videoId;
            if (videoId) {
                // Here you would typically open a modal with an embedded video player
                // For now, we'll just log the action
                console.log(`Opening video tutorial: ${videoId}`);
            }
        });
    });

    // Guide Downloads
    const guideCards = document.querySelectorAll('.guide-card[data-pdf]');
    guideCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const pdfUrl = card.dataset.pdf;
            if (pdfUrl) {
                // Here you would typically trigger the PDF download
                console.log(`Downloading guide: ${pdfUrl}`);
            }
        });
    });
}); 