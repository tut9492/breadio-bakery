# 🍪 Breadio Bakery

Transform X (Twitter) profile pictures into festive Christmas cookies using AI!

## 🎄 Features

- Fetch X profile pictures via TweetScout API
- Transform images into decorated Christmas cookies using OpenAI's GPT-Image-1
- Beautiful retro Christmas-themed UI
- Share cookies on X (Twitter)
- Download your cookie creations

## 🚀 Quick Start

### Local Development

```bash
cd frontend
npm install
# Install Vercel CLI for local testing
npm i -g vercel
vercel dev
```

### Production Deployment

Everything deploys to **Vercel** - no separate backend needed!

1. Deploy to Vercel (connects to GitHub automatically)
2. Add environment variables in Vercel dashboard:
   - `TWEETSCOUT_API_KEY`
   - `OPENAI_API_KEY`
3. Done! 🎉

## 📁 Project Structure

```
Tut bakery/
├── frontend/           # Web interface + API
│   ├── api/           # Vercel serverless functions
│   │   ├── health.js
│   │   ├── fetch-profile.js
│   │   └── transform-to-cookie.js
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── backend/           # (Legacy - kept for reference)
```

## 🔑 Required API Keys

- **TweetScout API Key** - Get at https://tweetscout.io
- **OpenAI API Key** - Get at https://platform.openai.com/api-keys

## 🌐 Deployment

### Vercel (All-in-One)

1. Connect GitHub repo to Vercel
2. Root directory: `frontend`
3. Add environment variables:
   - `TWEETSCOUT_API_KEY`
   - `OPENAI_API_KEY`
4. Deploy! 🚀

That's it! No separate backend needed.

## 📝 License

MIT

