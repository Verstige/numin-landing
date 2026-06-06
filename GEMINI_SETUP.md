# 🚀 Gemini API Setup Guide

## Why Switch to Gemini?
- ✅ **Completely FREE** - No credits or billing required
- ✅ **High Quality** - Google's advanced AI model
- ✅ **Fast Responses** - Optimized for real-time chat
- ✅ **No Quota Limits** - Generous free tier
- ✅ **Easy Integration** - Simple API setup

## 🔑 Getting Your Free Gemini API Key

### Step 1: Visit Google AI Studio
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account

### Step 2: Create API Key
1. Click **"Create API Key"**
2. Choose **"Create API key in new project"** (recommended)
3. Copy the generated API key

### Step 3: Add to Your Environment
Replace the placeholder in `.env.local`:

```bash
VITE_GEMINI_API_KEY=your-actual-gemini-api-key-here
```

### Step 4: Restart Development Server
```bash
# Kill current server
pkill -f "npm run dev"

# Start fresh server
npm run dev
```

## 🧠 Nova AI Features with Gemini

### Dual-Mode System
- **Assistant Mode**: Business intelligence and strategic insights
- **Chat Mode**: General conversation and support

### Business Intelligence
- Project portfolio analysis
- Team performance insights
- Risk assessment
- Growth opportunity identification
- Strategic recommendations

### Smart Features
- Context-aware responses
- Conversation memory
- Interactive suggestions
- Real-time business metrics

## 🎯 Testing Your Setup

### Quick Test
1. Open your app at `http://localhost:8080`
2. Sign in to your account
3. Try asking Nova: "Hello, can you help me analyze my projects?"
4. Switch between Assistant Mode and Chat Mode
5. Test business questions like: "What are the risks in my business strategy?"

### Expected Behavior
- ✅ Nova responds intelligently
- ✅ Mode switching works smoothly
- ✅ Business insights are context-aware
- ✅ Suggestions appear after responses
- ✅ Conversation history is preserved

## 🔧 Troubleshooting

### Common Issues

#### "API Key Missing"
- Ensure `.env.local` has `VITE_GEMINI_API_KEY=your-key`
- Restart the development server
- Check the key doesn't have extra spaces

#### "Having Trouble Connecting"
- Verify your Gemini API key is valid
- Check browser console for specific errors
- Ensure you're using the latest API key

#### "Model Not Found"
- Default model is `gemini-1.5-flash`
- This model is free and fast
- No changes needed for basic usage

## 🎉 Benefits of Gemini Integration

### Cost Savings
- **$0/month** vs OpenAI's paid plans
- No usage limits for development
- No billing setup required

### Performance
- Fast response times
- High-quality responses
- Excellent for business analysis

### Reliability
- Google's infrastructure
- 99.9% uptime
- Consistent performance

## 🚀 Next Steps

1. **Get your free API key** from Google AI Studio
2. **Update `.env.local`** with your key
3. **Restart the server** to load new configuration
4. **Test Nova AI** with business questions
5. **Enjoy your free AI assistant!**

Your Nova AI system is now powered by Google's Gemini - completely free and highly capable! 🎉
