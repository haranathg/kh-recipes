# KH Recipes

A voice-powered recipe app that converts dictated recipes into beautifully formatted recipe cards.

## Features

- 🎤 Voice dictation with editable transcript
- ✏️ Manual text input option
- ✨ AI-powered recipe formatting (via Claude)
- 📱 Mobile-friendly responsive design
- 🔍 Search recipes by name, description, or ingredients
- 🏷️ Category filtering
- ✏️ Edit saved recipes
- 🔄 Sync across devices (via S3)
- 🔒 Simple passkey protection

## Quick Start (Local Development)

### 1. Install dependencies

```bash
# Frontend
npm install

# Server
cd server
npm install
cd ..
```

### 2. Configure environment

```bash
# Copy the example env file
cp server/.env.example server/.env

# Edit server/.env and add your keys:
# ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
# PASSKEY=your-passkey-here
```

### 3. Run the app

```bash
# Terminal 1: Start the backend server
cd server
node index.js

# Terminal 2: Start the frontend dev server
npm run dev
```

Or run both at once:
```bash
npm run dev:all
```

### 4. Open in browser

Visit `http://localhost:5173`

For testing on your phone, find your computer's local IP and visit `http://YOUR_IP:5173`

## Project Structure

```
kh-recipes/
├── src/
│   ├── main.jsx          # Entry point
│   ├── App.jsx           # Main app with routing
│   ├── index.css         # Tailwind styles
│   ├── api/
│   │   └── index.js      # API helper functions
│   ├── hooks/
│   │   └── useRecipes.js # Recipe state management
│   └── components/
│       ├── PasskeyGate.jsx    # Login screen
│       ├── RecipeLibrary.jsx  # Home / recipe list
│       ├── RecipeCard.jsx     # Recipe list item
│       ├── AddRecipe.jsx      # Voice/text input
│       ├── RecipePreview.jsx  # Preview before save
│       ├── RecipeView.jsx     # View saved recipe
│       └── RecipeEdit.jsx     # Edit saved recipe
├── server/
│   ├── index.js          # Express API server
│   └── .env.example      # Environment template
└── package.json
```

## Deployment to AWS Amplify

### 1. Build the frontend
```bash
npm run build
```

### 2. Create Lambda functions

Convert `server/index.js` endpoints to Lambda handlers:
- `/api/auth` → auth function
- `/api/recipes` (GET/POST) → recipes function  
- `/api/parse` → parse function

### 3. Set up S3

```bash
# Enable S3 storage by setting in Lambda env vars:
USE_S3=true
S3_BUCKET=your-bucket-name
```

### 4. Deploy

- Host `dist/` folder on Amplify
- Configure API routes to Lambda functions
- Set environment variables in Lambda

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Claude API key |
| `PASSKEY` | Simple passkey for access |
| `USE_S3` | Set to `true` for S3 storage |
| `S3_BUCKET` | S3 bucket name |
| `AWS_REGION` | AWS region (default: us-east-1) |

## Usage Tips

1. **Voice input:** Tap the microphone, describe your recipe naturally, then tap again to stop
2. **Edit transcript:** Fix any speech recognition errors before formatting
3. **Format:** Claude will structure your recipe into ingredients and steps
4. **Review:** Check the preview and select a category before saving
5. **Edit later:** Tap the pencil icon on any recipe to make changes
