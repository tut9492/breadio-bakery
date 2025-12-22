const express = require('express');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const TWEETSCOUT_API_KEY = process.env.TWEETSCOUT_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Cookie transformation prompt - royal icing style
const COOKIE_PROMPT = `Using the provided image as reference, create a tasty, perfectly formed sugar cookie decorated with smooth royal icing based on the subject or image. If the image contains a person, render a simplified icing likeness of their face that clearly resembles them while remaining non-photorealistic; if the image contains an object, animal, or scene, translate its most recognizable features into a friendly royal-icing design using the same logic. The cookie should be stamped in a simple, easy-to-cut silhouette, with the design piped entirely in feasible royal-icing shapes—chunky, smooth lines rather than fine illustration detail, minimal shading, and clean, confident outlines like those used by a skilled cookie artist. Colors should be vibrant, playful, and holiday-friendly without needing to follow real-world color accuracy. Add small, simplified seasonal accents such as holly, snowflakes, sparkles, a scarf, or a beanie rendered as basic piped shapes, avoiding anything overtly religious or denominational. The final result should feel cute, approachable, and clearly edible, emphasizing handcrafted charm, clarity, and a strong resemblance achieved through simplified, piped decoration rather than realism.

Scene + framing: square 1024x1024 close-up food photography. The cookie is placed on crinkled parchment paper (baking sheet vibe), with soft natural lighting, shallow depth of field, and gentle shadows. Background should be parchment texture (not a flat color). Do not include any extra text or watermarks.`;

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Cookie transformer API is running!' });
});

// Fetch X profile by username
app.get('/api/fetch-profile', async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Username is required' });

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

        res.json({
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
});

// Transform image to cookie using OpenAI gpt-image-1
app.post('/api/transform-to-cookie', async (req, res) => {
    const { imageUrl, username } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });

    try {
        console.log(`🍪 Transforming @${username}'s profile picture into a cookie...`);

        // Download the image
        console.log('📥 Downloading image...');
        const imageResponse = await axios.get(imageUrl, { 
            responseType: 'arraybuffer',
            timeout: 30000
        });

        // Create form data for OpenAI
        const formData = new FormData();
        formData.append('image', Buffer.from(imageResponse.data), {
            filename: 'profile.png',
            contentType: 'image/png'
        });
        formData.append('prompt', COOKIE_PROMPT);
        formData.append('model', 'gpt-image-1');
        formData.append('n', '1');
        formData.append('size', '1024x1024');

        // Call OpenAI Images API
        console.log('🎨 Generating cookie with OpenAI gpt-image-1...');
        const response = await axios.post(
            'https://api.openai.com/v1/images/edits',
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    ...formData.getHeaders()
                },
                timeout: 180000 // 3 minute timeout for image generation
            }
        );

        // Get the image - could be URL or base64
        let cookieImage;
        if (response.data.data[0].url) {
            cookieImage = response.data.data[0].url;
        } else if (response.data.data[0].b64_json) {
            // Convert base64 to data URI for browser display
            cookieImage = `data:image/png;base64,${response.data.data[0].b64_json}`;
        }
        
        console.log('✅ Cookie generated successfully!');

        res.json({
            success: true,
            originalImage: imageUrl,
            cookieImage: cookieImage,
            username: username
        });
    } catch (error) {
        console.error('❌ OpenAI API Error:', error.response?.data || error.message);
        
        const errorMessage = error.response?.data?.error?.message || error.message;
        
        res.status(500).json({ 
            error: 'Failed to transform image',
            message: errorMessage,
            details: error.response?.data
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🍪 Cookie Transformer API running on http://localhost:${PORT}`);
    console.log(`📝 TweetScout API Key: ${TWEETSCOUT_API_KEY ? '✓ Configured' : '✗ Missing'}`);
    console.log(`🤖 OpenAI API Key: ${OPENAI_API_KEY ? '✓ Configured' : '✗ Missing'}`);
    console.log(`\n🎄 Ready to bake some cookies!\n`);
});
