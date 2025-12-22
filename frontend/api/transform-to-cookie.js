const axios = require('axios');
const FormData = require('form-data');

// Cookie transformation prompt - royal icing style
const COOKIE_PROMPT = `Using the provided image as reference, create a tasty, perfectly formed sugar cookie decorated with smooth royal icing based on the subject or image. If the image contains a person, render a simplified icing likeness of their face that clearly resembles them while remaining non-photorealistic; if the image contains an object, animal, or scene, translate its most recognizable features into a friendly royal-icing design using the same logic. The cookie should be stamped in a simple, easy-to-cut silhouette, with the design piped entirely in feasible royal-icing shapes—chunky, smooth lines rather than fine illustration detail, minimal shading, and clean, confident outlines like those used by a skilled cookie artist. Colors should be vibrant, playful, and holiday-friendly without needing to follow real-world color accuracy. Add small, simplified seasonal accents such as holly, snowflakes, sparkles, a scarf, or a beanie rendered as basic piped shapes, avoiding anything overtly religious or denominational. The final result should feel cute, approachable, and clearly edible, emphasizing handcrafted charm, clarity, and a strong resemblance achieved through simplified, piped decoration rather than realism.

Scene + framing: square 1024x1024 close-up food photography. The cookie is placed on crinkled parchment paper (baking sheet vibe), with soft natural lighting, shallow depth of field, and gentle shadows. Background should be parchment texture (not a flat color). Do not include any extra text or watermarks.`;

module.exports = async (req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { imageUrl, username } = req.body;
    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

        res.status(200).json({
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
};

