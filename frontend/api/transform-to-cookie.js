import axios from 'axios';
import FormData from 'form-data';

// Different cookie style prompts (max 1000 chars each for OpenAI API)
const COOKIE_PROMPTS = {
    'royal-icing': `Create a sugar cookie decorated with royal icing based on the provided image. If person: simplified icing face that resembles them (non-photorealistic). If object/animal/scene: translate recognizable features into friendly royal-icing design. Simple silhouette, chunky piped shapes (thick smooth lines, minimal shading, confident outlines). Vibrant holiday colors. Add seasonal accents: holly, snowflakes, sparkles, scarf, beanie (basic piped shapes). Cute, edible, handcrafted charm. Square 1024x1024 food photo: cookie on crinkled parchment, soft lighting, shallow depth of field, gentle shadows. Parchment background. No text or watermarks.`,

    'gingerbread': `Gingerbread cookie with royal icing resembling the subject (simplified cookie-art style). Cookie: deep brown gingerbread, darker edges, natural cracks, matte texture, realistic/edible. Photo: overhead-to-3/4 angle, soft light, shadow, shallow depth. Background: light tan parchment with crinkles. Icing: simple silhouette, thick smooth outlines, chunky fills, minimal shading, bold strokes. Keep likeness via recognizable features (head, hair, glasses, eyes). Colors: ivory/white main, optional caramel/tan, muted red/green accents. Add gingerbread piping motifs: chunky dots, scallops, stitch lines, snowflakes/stars. Optional sweater/scarf as chunky icing shape. Center cookie, square image, holiday vibe. No text/watermarks.`,

    'sprinkles': `Vanilla sugar cookie with royal icing resembling subject (simplified cookie-art) + maximal chaotic sprinkles. Cookie: golden vanilla, browned edges, buttery texture, realistic. Photo: bright soft lighting, crisp focus, shallow depth, natural shadow. Background: tan parchment with crinkles. Icing: simple silhouette, chunky shapes (thick outline, bold fills, minimal shading). Likeness via iconic features (head, hair, glasses, eyes, mouth). Ultra-vibrant colors: neon + pastel mix (pink, blue, lime, purple, aqua, yellow). Heavy sprinkles: nonpareils, jimmies, confetti, stars, crystals - dense on parchment, lighter on icing. Add 2-4 chunky seasonal accents: sparkles, stars, snowflakes, candy dots, beanie/scarf. Glossy icing texture. Center cookie, square image. Bright, fun, edible, handcrafted. No text/watermarks.`
};

export default async function handler(req, res) {
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

    const { imageUrl, username, cookieStyle = 'royal-icing' } = req.body;
    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    // Get the prompt for the selected style, default to royal-icing
    const COOKIE_PROMPT = COOKIE_PROMPTS[cookieStyle] || COOKIE_PROMPTS['royal-icing'];

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    try {
        console.log(`🍪 Transforming @${username}'s profile picture into a ${cookieStyle} cookie...`);

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
        formData.append('n', '1');
        formData.append('size', '1024x1024');

        // Call OpenAI Images API
        // Note: /v1/images/edits doesn't require a model parameter
        console.log('🎨 Generating cookie with OpenAI Images API...');
        
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }
        
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
        if (!response.data || !response.data.data || !response.data.data[0]) {
            throw new Error('OpenAI API returned invalid response format');
        }
        
        let cookieImage;
        if (response.data.data[0].url) {
            cookieImage = response.data.data[0].url;
        } else if (response.data.data[0].b64_json) {
            // Convert base64 to data URI for browser display
            cookieImage = `data:image/png;base64,${response.data.data[0].b64_json}`;
        } else {
            throw new Error('OpenAI API response missing image data');
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
        console.error('Error stack:', error.stack);
        
        // Extract more detailed error message
        let errorMessage = error.message;
        if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
        } else if (error.response?.data) {
            errorMessage = JSON.stringify(error.response.data);
        }
        
        // Check for specific error types
        if (error.message?.includes('OPENAI_API_KEY')) {
            errorMessage = 'OpenAI API key is missing. Please configure OPENAI_API_KEY in Vercel environment variables.';
        } else if (error.response?.status === 401) {
            errorMessage = 'OpenAI API key is invalid or expired.';
        } else if (error.response?.status === 429) {
            errorMessage = 'OpenAI API rate limit exceeded. Please try again later.';
        } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            errorMessage = 'Request timed out. The image generation took too long.';
        }
        
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to transform image',
            message: errorMessage,
            details: error.response?.data || { message: error.message }
        });
    }
}

