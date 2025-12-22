const axios = require('axios');

module.exports = async (req, res) => {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const TWEETSCOUT_API_KEY = process.env.TWEETSCOUT_API_KEY;

    try {
        console.log(`📷 Fetching profile for @${username}...`);
        const response = await axios.get(`https://api.tweetscout.io/v2/info/${username}`, {
            headers: {
                'apikey': TWEETSCOUT_API_KEY
            }
        });

        const accountData = response.data;
        let avatarUrl = accountData.avatar || accountData.profile_image_url || accountData.avatar_url;

        if (!avatarUrl) {
            return res.status(404).json({ 
                error: 'Could not find profile picture for this user'
            });
        }

        // Get higher resolution avatar (replace _normal with _400x400)
        avatarUrl = avatarUrl.replace('_normal', '_400x400');

        console.log(`✅ Found profile: ${accountData.name} (@${accountData.screen_name})`);

        res.status(200).json({
            username: username,
            avatar: avatarUrl,
            name: accountData.name,
            accountData: accountData
        });
    } catch (error) {
        console.error('❌ TweetScout API Error:', error.response?.data || error.message);
        
        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (error.response?.status === 401) {
            return res.status(500).json({ error: 'API authentication failed' });
        }
        res.status(500).json({ 
            error: 'Failed to fetch profile',
            message: error.message
        });
    }
};

