// API URL - use relative paths for Vercel serverless functions
// In production, these will be /api/health, /api/fetch-profile, etc.
// For local development with Vercel dev, it will work automatically
const API_URL = window.API_URL || '';

let currentCookieUrl = null;
let currentUsername = null;


// Initialize event listeners (works whether DOM is already loaded or not)
function initializeEventListeners() {
    
    // Handle enter key on input
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                bakeCookie();
            }
        });
    }
    
    // Add click listener to bake button (more reliable than onclick)
    const bakeBtn = document.getElementById('bake-btn');
    
    if (bakeBtn) {
        bakeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            bakeCookie();
        });
    } else {
        console.error('❌ Bake button not found!');
    }
}

// Wait for DOM to be ready, or run immediately if already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
    // DOM is already loaded, run immediately
    initializeEventListeners();
}

// Add event listener for share button (more reliable than inline onclick)
// Use event delegation since button is in dynamically shown section
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'share-btn') {
        e.preventDefault();
        shareOnX();
    }
});

async function bakeCookie() {
    const usernameInput = document.getElementById('username');
    const bakeBtn = document.getElementById('bake-btn');
    const results = document.getElementById('results');
    const error = document.getElementById('error');
    
    if (!usernameInput || !bakeBtn || !results || !error) {
        console.error('Missing required elements:', { usernameInput, bakeBtn, results, error });
        alert('Page not fully loaded. Please refresh and try again.');
        return;
    }
    
    // Clean username (remove @ if present)
    let username = usernameInput.value.trim().replace('@', '');
    
    if (!username) {
        showError('please enter a username');
        return;
    }
    
    // Get selected cookie style
    const styleRadio = document.querySelector('input[name="cookie-style"]:checked');
    if (!styleRadio) {
        showError('please select a cookie style');
        bakeBtn.classList.remove('loading');
        return;
    }
    const selectedStyle = styleRadio.value;
    
    // Reset state
    hideError();
    results.classList.remove('visible');
    document.getElementById('score-section').style.display = 'none';
    bakeBtn.classList.add('loading');
    currentUsername = username;
    
    try {
        // Step 1: Fetch profile
        console.log(`🔍 Fetching profile for @${username}...`);
        console.log(`API URL: ${API_URL || '(empty - using relative paths)'}`);
        
        let profileRes;
        try {
            profileRes = await fetch(`${API_URL}/api/fetch-profile?username=${encodeURIComponent(username)}`);
        } catch (fetchError) {
            console.error('Fetch error:', fetchError);
            throw new Error(`Network error: ${fetchError.message}. Check if API endpoints are deployed correctly.`);
        }
        
        if (!profileRes.ok) {
            const contentType = profileRes.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const err = await profileRes.json();
                throw new Error(err.error || 'Failed to fetch profile');
            } else {
                // Got HTML or other non-JSON response (likely 404)
                throw new Error(`API endpoint not found (${profileRes.status}). Please check Vercel deployment.`);
            }
        }
        
        const profileContentType = profileRes.headers.get('content-type');
        if (!profileContentType || !profileContentType.includes('application/json')) {
            throw new Error('API returned non-JSON response. Please check deployment.');
        }
        
        const profileData = await profileRes.json();
        const avatarUrl = profileData.avatar;
        
        // Show original image
        document.getElementById('original-img').src = avatarUrl;
        
        // Step 2: Transform to cookie
        console.log(`🍪 Transforming to cookie (style: ${selectedStyle})...`);
        
        let transformRes;
        try {
            transformRes = await fetch(`${API_URL}/api/transform-to-cookie`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageUrl: avatarUrl,
                    username: username,
                    cookieStyle: selectedStyle
                })
            });
        } catch (fetchError) {
            console.error('Fetch error:', fetchError);
            throw new Error(`Network error: ${fetchError.message}. Check if API endpoints are deployed correctly.`);
        }
        
        if (!transformRes.ok) {
            const contentType = transformRes.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const err = await transformRes.json();
                throw new Error(err.error || 'Failed to transform image');
            } else {
                // Got HTML or other non-JSON response (likely 404)
                throw new Error(`API endpoint not found (${transformRes.status}). Please check Vercel deployment.`);
            }
        }
        
        const transformContentType = transformRes.headers.get('content-type');
        if (!transformContentType || !transformContentType.includes('application/json')) {
            throw new Error('API returned non-JSON response. Please check deployment.');
        }
        
        const transformData = await transformRes.json();
        currentCookieUrl = transformData.cookieImage;
        
        // Show cookie image
        document.getElementById('cookie-img').src = currentCookieUrl;
        
        // Show results
        results.classList.add('visible');
        console.log(`✅ Cookie created for @${username}!`);
        
        // Display score if available
        if (profileData.score !== null && profileData.score !== undefined) {
            displayScore(profileData.score);
        }
        
        // FOR LOCAL TESTING ONLY - Uncomment to test score UI without API:
        // displayScore(1250); // Mock score: "certified nice booty" + "at home espresso kit"
        
    } catch (err) {
        console.error('Error:', err);
        showError(err.message || 'something went wrong');
    } finally {
        bakeBtn.classList.remove('loading');
    }
}

function downloadCookie() {
    if (!currentCookieUrl) return;
    
    const filename = `${currentUsername || 'cookie'}-christmas-cookie.png`;
    
    // Handle data URI (base64) images
    if (currentCookieUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = currentCookieUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        // For regular URLs, open in new tab
        window.open(currentCookieUrl, '_blank');
    }
}

async function shareOnX() {
    if (!currentCookieUrl) {
        console.error('No cookie URL available');
        showError('no cookie to share');
        return;
    }
    
    try {
        const tweetText = 'merry bootymas\n\nget your cookie and year end booty score by @Tuteth_';
        
        // Check if Web Share API is available (supports images)
        if (navigator.share && navigator.canShare) {
            try {
                // Convert image to File/Blob for sharing
                let imageFile;
                
                if (currentCookieUrl.startsWith('data:')) {
                    // Handle base64 data URI
                    const response = await fetch(currentCookieUrl);
                    const blob = await response.blob();
                    imageFile = new File([blob], 'cookie.png', { type: 'image/png' });
                } else {
                    // Handle URL - fetch and convert to File
                    const response = await fetch(currentCookieUrl);
                    const blob = await response.blob();
                    imageFile = new File([blob], 'cookie.png', { type: 'image/png' });
                }
                
                // Check if we can share the file
                const shareData = {
                    title: 'merry bootymas',
                    text: tweetText,
                    files: [imageFile]
                };
                
                if (navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                    console.log('✅ Shared via Web Share API');
                    return;
                }
            } catch (shareError) {
                console.warn('Web Share API failed, falling back to X intent:', shareError);
            }
        }
        
        // Fallback: X intent URL (text only, no image)
        const encodedText = encodeURIComponent(tweetText);
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        
        console.log('Opening share URL:', shareUrl);
        
        // Open X compose window
        const shareWindow = window.open(
            shareUrl, 
            'twitter-share',
            'width=550,height=420,resizable=yes,scrollbars=yes'
        );
        
        if (!shareWindow || shareWindow.closed || typeof shareWindow.closed === 'undefined') {
            // Popup blocked - fallback to direct navigation
            console.warn('Popup blocked, trying direct navigation');
            window.location.href = shareUrl;
        }
    } catch (error) {
        console.error('Error sharing on X:', error);
        showError('failed to open share window: ' + error.message);
    }
}

function showError(message) {
    const error = document.getElementById('error');
    error.textContent = message;
    error.classList.add('visible');
}

function hideError() {
    const error = document.getElementById('error');
    error.classList.remove('visible');
}

// Scoring system based on your criteria
function getBootyRating(score) {
    if (score >= 1000) {
        return {
            booty: "Best natural booty in web3",
            present: "CryptoPunk"
        };
    } else if (score >= 900) {
        return {
            booty: "absolute dump truck",
            present: "Bidet attachment"
        };
    } else if (score >= 800) {
        return {
            booty: "Economically Significant",
            present: "Digital photo frame"
        };
    } else if (score >= 700) {
        return {
            booty: "Booty With Lore",
            present: "Smart doorbell"
        };
    } else if (score >= 600) {
        return {
            booty: "Whole Foods Organic",
            present: "Noise-canceling headphones"
        };
    } else if (score >= 500) {
        return {
            booty: "Algorithm Boosted",
            present: "At-home espresso kit"
        };
    } else if (score >= 400) {
        return {
            booty: "Booty With Lore",
            present: "Dyson vacuum"
        };
    } else if (score >= 300) {
        return {
            booty: "Historic Landmark",
            present: "Heated blanket"
        };
    } else if (score >= 200) {
        return {
            booty: "Sneaky Side-Angle",
            present: "Electric toothbrush"
        };
    } else if (score >= 100) {
        return {
            booty: "National Treasure",
            present: "Fancy olive oil"
        };
    } else {
        return {
            booty: "pancake booty",
            present: "Socks From grandma"
        };
    }
}

// Display score with booty rating
function displayScore(score) {
    const scoreSection = document.getElementById('score-section');
    const bootyText = document.getElementById('booty-text');
    const presentText = document.getElementById('present-text');
    const progressFill = document.getElementById('progress-fill');
    const progressHandle = document.getElementById('progress-handle');
    
    // Get booty rating and present
    const rating = getBootyRating(score);
    bootyText.textContent = rating.booty;
    presentText.textContent = rating.present;
    
    // Calculate progress (0-1000 range to show all booty types)
    const maxScore = 1000;
    const progress = Math.min((score / maxScore) * 100, 100);
    
    // Update progress bar
    progressFill.style.width = `${progress}%`;
    progressHandle.style.left = `${progress}%`;
    
    // Show score section
    scoreSection.style.display = 'block';
}



