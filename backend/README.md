# Christmas Cookie Transformer - Backend

Backend API for transforming X (Twitter) profile pictures into Christmas cookies.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add your OpenAI API key to `.env`:
```env
OPENAI_API_KEY=sk-proj-your-key-here
```

3. Start the server:
```bash
npm start
```

Server runs on http://localhost:3001

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/fetch-profile?username=USERNAME` - Fetch X profile
- `POST /api/transform-to-cookie` - Transform image to cookie

## Testing
```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/fetch-profile?username=elonmusk
```
