# 🍪 Breadio Bakery

Transform X (Twitter) profile pictures into festive Christmas cookies using AI!

## 🎄 Features

- Fetch X profile pictures via TweetScout API
- Transform images into decorated Christmas cookies using OpenAI's GPT-Image-1
- Beautiful retro Christmas-themed UI
- Share cookies on X (Twitter)
- Download your cookie creations

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Add your API keys
npm start
```

### Frontend Setup

```bash
cd frontend
# Open index.html in browser or use a local server
python3 -m http.server 3002
```

## 📁 Project Structure

```
Tut bakery/
├── backend/          # Express API server
│   ├── server.js    # Main server file
│   └── .env         # API keys (not in git)
└── frontend/        # Web interface
    ├── index.html
    ├── styles.css
    └── app.js
```

## 🔑 Required API Keys

- **TweetScout API Key** - Get at https://tweetscout.io
- **OpenAI API Key** - Get at https://platform.openai.com/api-keys

## 🌐 Deployment

### Frontend (Vercel/Netlify)
- Deploy the `frontend/` folder
- Set environment variable: `VITE_API_URL` or update `API_URL` in `app.js`

### Backend (Railway/Render)
- Deploy the `backend/` folder
- Set environment variables: `TWEETSCOUT_API_KEY`, `OPENAI_API_KEY`, `PORT`

## 📝 License

MIT

