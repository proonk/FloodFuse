// DOM Elements
const createPostForm = document.querySelector('.post-form textarea');
const shareUpdateBtn = document.querySelector('.post-form .btn.primary');
const filterTabs = document.querySelectorAll('.filter-tab');
const sortSelect = document.querySelector('.filter-select');
const feedItems = document.querySelector('.feed-items');
const loadMoreBtn = document.querySelector('.load-more .btn');
const commentModal = document.getElementById('commentModal');
const commentForm = document.querySelector('.comment-form');
const closeModalBtns = document.querySelectorAll('.close-modal');

// Sample data structure for posts
let posts = [
    {
        id: 1,
        type: 'emergency',
        author: 'Emergency Response Team',
        avatar: 'https://ui-avatars.com/api/?name=Emergency+Response&background=ff4444&color=fff',
        time: '10 minutes ago',
        content: '⚠️ URGENT: Flash flood warning for Downtown area. River levels rising rapidly. Please avoid riverside areas and follow evacuation instructions if provided.',
        image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5',
        metrics: {
            riverLevel: '3.2m (Rising)',
            location: 'Downtown River District'
        },
        comments: 23,
        likes: 0
    },
    // More posts can be added here
];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateLastActive();
});

// Event Listeners
function initializeEventListeners() {
    // Share Update Button
    shareUpdateBtn.addEventListener('click', handleCreatePost);

    // Filter Tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => handleFilterChange(tab));
    });

    // Sort Select
    sortSelect.addEventListener('change', handleSortChange);

    // Load More Button
    loadMoreBtn.addEventListener('click', loadMorePosts);

    // Comment Buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        if (btn.innerHTML.includes('Comment')) {
            btn.addEventListener('click', () => openCommentModal(btn.closest('.feed-item')));
        }
    });

    // Close Modal Buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Like Buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        if (btn.innerHTML.includes('Like')) {
            btn.addEventListener('click', handleLike);
        }
    });

    // Share Buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        if (btn.innerHTML.includes('Share')) {
            btn.addEventListener('click', handleShare);
        }
    });

    // Attachment Buttons
    document.querySelectorAll('.attachment-btn').forEach(btn => {
        btn.addEventListener('click', handleAttachment);
    });
}

// Post Creation
function handleCreatePost() {
    const content = createPostForm.value.trim();
    if (!content) return;

    // Create new post object
    const newPost = {
        id: Date.now(),
        type: 'update',
        author: 'Admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin',
        time: 'Just now',
        content: content,
        comments: 0,
        likes: 0
    };

    // Add to posts array and update UI
    posts.unshift(newPost);
    renderPost(newPost);
    createPostForm.value = '';
}

// Filter Handling
function handleFilterChange(selectedTab) {
    filterTabs.forEach(tab => tab.classList.remove('active'));
    selectedTab.classList.add('active');
    
    const filter = selectedTab.textContent.toLowerCase();
    filterPosts(filter);
}

function filterPosts(filter) {
    const items = document.querySelectorAll('.feed-item');
    items.forEach(item => {
        if (filter === 'all updates') {
            item.style.display = 'block';
        } else {
            const postType = item.querySelector('.post-badge').textContent.toLowerCase();
            item.style.display = postType.includes(filter) ? 'block' : 'none';
        }
    });
}

// Sort Handling
function handleSortChange(e) {
    const sortBy = e.target.value;
    sortPosts(sortBy);
}

function sortPosts(sortBy) {
    const sortedPosts = [...posts];
    switch(sortBy) {
        case 'urgent':
            sortedPosts.sort((a, b) => (b.type === 'emergency') - (a.type === 'emergency'));
            break;
        case 'discussed':
            sortedPosts.sort((a, b) => b.comments - a.comments);
            break;
        default: // recent
            sortedPosts.sort((a, b) => b.id - a.id);
    }
    renderAllPosts(sortedPosts);
}

// Post Rendering
function renderPost(post) {
    const postElement = document.createElement('div');
    postElement.className = `feed-item ${post.type === 'emergency' ? 'urgent' : ''}`;
    // Add post HTML structure here
    feedItems.insertBefore(postElement, feedItems.firstChild);
}

function renderAllPosts(postsToRender) {
    feedItems.innerHTML = '';
    postsToRender.forEach(post => renderPost(post));
}

// Comment Modal
function openCommentModal(postElement) {
    commentModal.style.display = 'block';
    // Load comments for the specific post
    loadComments(postElement);
}

function closeModal() {
    commentModal.style.display = 'none';
}

function loadComments(postElement) {
    // Implementation for loading comments
    console.log('Loading comments for post:', postElement);
}

// Like Handling
function handleLike(e) {
    const likeBtn = e.currentTarget;
    const currentLikes = parseInt(likeBtn.textContent.match(/\d+/)[0]);
    likeBtn.innerHTML = `<i class="fas fa-heart"></i> Like (${currentLikes + 1})`;
    likeBtn.style.color = '#ef4444';
}

// Share Handling
async function handleShare(e) {
    const postElement = e.currentTarget.closest('.feed-item');
    const postContent = postElement.querySelector('.post-content p').textContent;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Flood AI Update',
                text: postContent,
                url: window.location.href
            });
        } catch (err) {
            console.log('Error sharing:', err);
        }
    } else {
        // Fallback for browsers that don't support Web Share API
        alert('Sharing functionality is not supported in your browser');
    }
}

// Attachment Handling
function handleAttachment(e) {
    const type = e.currentTarget.querySelector('span').textContent.toLowerCase();
    switch(type) {
        case 'photo':
            // Implementation for photo upload
            console.log('Photo upload clicked');
            break;
        case 'location':
            // Implementation for location selection
            console.log('Location selection clicked');
            break;
        case 'alert level':
            // Implementation for alert level selection
            console.log('Alert level selection clicked');
            break;
    }
}

// Update timestamps
function updateLastActive() {
    const timeElements = document.querySelectorAll('.post-time');
    timeElements.forEach(element => {
        // Implementation for updating relative time
        // This could use a library like moment.js for better time handling
    });
}

// Load more posts
function loadMorePosts() {
    // Implementation for loading more posts
    console.log('Loading more posts...');
    // This would typically involve an API call to fetch more posts
} 