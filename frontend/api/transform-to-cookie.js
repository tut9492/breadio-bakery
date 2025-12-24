import axios from 'axios';
import FormData from 'form-data';

// Different cookie style prompts
const COOKIE_PROMPTS = {
    'royal-icing': `Using the provided image as reference, create a tasty, perfectly formed sugar cookie decorated with smooth royal icing based on the subject or image. If the image contains a person, render a simplified icing likeness of their face that clearly resembles them while remaining non-photorealistic; if the image contains an object, animal, or scene, translate its most recognizable features into a friendly royal-icing design using the same logic. The cookie should be stamped in a simple, easy-to-cut silhouette, with the design piped entirely in feasible royal-icing shapes—chunky, smooth lines rather than fine illustration detail, minimal shading, and clean, confident outlines like those used by a skilled cookie artist. Colors should be vibrant, playful, and holiday-friendly without needing to follow real-world color accuracy. Add small, simplified seasonal accents such as holly, snowflakes, sparkles, a scarf, or a beanie rendered as basic piped shapes, avoiding anything overtly religious or denominational. The final result should feel cute, approachable, and clearly edible, emphasizing handcrafted charm, clarity, and a strong resemblance achieved through simplified, piped decoration rather than realism.

Scene + framing: square 1024x1024 close-up food photography. The cookie is placed on crinkled parchment paper (baking sheet vibe), with soft natural lighting, shallow depth of field, and gentle shadows. Background should be parchment texture (not a flat color). Do not include any extra text or watermarks.`,

    'gingerbread': `Using the provided image as reference, generate a single, perfectly formed classic gingerbread cookie decorated with royal icing to resemble the subject clearly, but in a simplified, non-photorealistic cookie-art style.

COOKIE + PHOTO RULES:
- The cookie base is gingerbread: deep warm brown (molasses), with slightly darker baked edges, tiny natural cracks, and a soft matte baked texture.
- The cookie is realistic and edible (no plastic/toy look).
- Shot as a food photograph: overhead-to-3/4 angle, soft diffused light, gentle shadow under the cookie, shallow depth of field.
- Background is parchment paper: light tan, subtle crinkles, faint grease spots, slight flour dusting.

ICING DESIGN RULES:
- Use a simple, easy-to-cut silhouette that matches the subject's overall outline. No fragile skinny shapes.
- All details are created as feasible piped icing shapes: thick smooth outlines, chunky fills, minimal shading.
- Avoid fine illustration lines; keep strokes bold and confident like a professional cookie artist.
- Keep the likeness through the most recognizable features (head shape, hair/ears/hat, glasses/eyes, signature marks).
- If the subject is a person: simplified face with clean shapes (eyes/mouth/eyebrows) that resembles them, not realistic skin pores.

GINGERBREAD-STYLE PIPING AESTHETIC:
- Color palette: ivory/white icing as main linework + accents, with optional caramel/tan, muted cranberry red, muted pine green (small touches only).
- Add traditional gingerbread piping motifs as border accents ONLY: chunky dots, scallops, simple stitch lines, and small snowflake/star shapes—keep them big enough to pipe.
- Add a simple frosted "sweater" or "scarf" element as a single chunky icing shape if it fits the subject.
- Minimal shading: at most 1–2 gentle icing tones per major area (e.g., ivory + slightly darker cream), no airbrush gradients.

COMPOSITION:
- Center the cookie, plenty of breathing room, square image.
- No text, no logos added, no watermark.
- Holiday-friendly, cozy bakery vibe.`,

    'sprinkles': `Using the provided image as reference, generate a single, perfectly formed vanilla sugar cookie decorated with royal icing to resemble the subject clearly, in a simplified, playful cookie-art style — and then make it a maximal, chaotic sprinkle cookie.

COOKIE + PHOTO RULES:
- Cookie base is golden vanilla sugar cookie: lightly browned edges, buttery baked texture, slight surface pitting, realistic crumb.
- Shot as a food photograph: bright soft studio lighting, crisp focus on the cookie, shallow depth of field, natural shadow.
- Background is parchment paper on a baking sheet vibe: light tan parchment with subtle crinkles, faint grease marks, a few stray sugar grains.
- Square image, centered composition.

ICING DESIGN RULES:
- Use a simple stamped silhouette that is easy to cut.
- The character/object is rendered entirely with chunky, feasible royal-icing shapes:
  - thick outline
  - bold fills
  - minimal shading (no painterly gradients)
- Likeness is achieved by simplifying the most iconic features (big shapes first: head/hat/hair/ears, glasses/eyes, mouth, signature symbols).
- Keep it cute and readable even at a glance.

WILD CHILD COLOR + SPRINKLE RULES:
- Icing palette is ultra-vibrant and playful: neon + pastel mix (hot pink, electric blue, lime, purple, aqua, sunny yellow).
- Add heavy, chaotic sprinkles:
  - nonpareils, jimmies, confetti quins, tiny star sprinkles, and sugar crystals
  - sprinkles scattered densely around the cookie on parchment
  - a lighter layer of sprinkles on top of icing in a few areas (don't fully bury the face/details)
- Sprinkle distribution should feel "accidentally dumped a whole jar" but still like a real bakery photo.
- Add 2–4 simple piped seasonal accents (chunky): sparkles, stars, snowflakes, tiny candy dots, maybe a simple beanie/scarf shape.
- No religious/denominational symbols.

FINISHING:
- Make the icing slightly glossy with subtle texture, like set royal icing.
- No text, no watermark, no extra logos added.
- The overall mood is "kid-core holiday chaos," bright, fun, edible, handcrafted.`
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
}

