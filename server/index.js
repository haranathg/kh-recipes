import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// For local dev, use a JSON file. For production, use S3.
const USE_S3 = process.env.USE_S3 === 'true';
const LOCAL_DATA_FILE = join(__dirname, 'recipes-data.json');

// S3 client (only used if USE_S3 is true)
const s3Client = USE_S3 ? new S3Client({ region: process.env.AWS_REGION || 'us-east-1' }) : null;

// Passkey check middleware
const checkPasskey = (req, res, next) => {
  const passkey = req.headers['x-passkey'];
  if (passkey !== process.env.PASSKEY) {
    return res.status(401).json({ error: 'Invalid passkey' });
  }
  next();
};

// Get recipes from storage
async function getRecipes() {
  if (USE_S3) {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: 'recipes.json',
      });
      const response = await s3Client.send(command);
      const body = await response.Body.transformToString();
      return JSON.parse(body);
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return { recipes: [], updatedAt: new Date().toISOString() };
      }
      throw error;
    }
  } else {
    // Local file storage
    if (existsSync(LOCAL_DATA_FILE)) {
      const data = readFileSync(LOCAL_DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return { recipes: [], updatedAt: new Date().toISOString() };
  }
}

// Save recipes to storage
async function saveRecipes(data) {
  data.updatedAt = new Date().toISOString();
  
  if (USE_S3) {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: 'recipes.json',
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    });
    await s3Client.send(command);
  } else {
    writeFileSync(LOCAL_DATA_FILE, JSON.stringify(data, null, 2));
  }
  
  return data;
}

// Verify passkey endpoint
app.post('/api/auth', (req, res) => {
  const { passkey } = req.body;
  if (passkey === process.env.PASSKEY) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid passkey' });
  }
});

// Get all recipes
app.get('/api/recipes', checkPasskey, async (req, res) => {
  try {
    const data = await getRecipes();
    res.json(data);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Save all recipes
app.post('/api/recipes', checkPasskey, async (req, res) => {
  try {
    const data = await saveRecipes(req.body);
    res.json(data);
  } catch (error) {
    console.error('Error saving recipes:', error);
    res.status(500).json({ error: 'Failed to save recipes' });
  }
});

// Parse recipe with Claude
app.post('/api/parse', checkPasskey, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No recipe text provided' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Parse this dictated recipe into structured JSON. Extract the recipe name, description, prep time, cook time, servings, ingredients list, step-by-step instructions, and suggest an appropriate category.

Recipe text:
"${text}"

Categories to choose from: Breakfast, Mains, Sides, Desserts, Snacks, Drinks, Sauces & Dips, Powders, Temple Recipes, Other

Respond ONLY with valid JSON in this exact format:
{
  "name": "Recipe Name",
  "description": "Brief appetizing description (1-2 sentences)",
  "category": "Category from the list above",
  "prepTime": "X mins",
  "cookTime": "X mins",
  "servings": "X servings",
  "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount"],
  "instructions": ["Step 1 as a complete sentence", "Step 2 as a complete sentence"]
}

If any field is not mentioned, make a reasonable guess. Clean up the language to be clear and professional. Make sure ingredients include amounts and instructions are clear, complete sentences.`
        }
      ]
    });

    const content = message.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const recipe = JSON.parse(jsonMatch[0]);
      res.json(recipe);
    } else {
      res.status(500).json({ error: 'Could not parse recipe' });
    }
  } catch (error) {
    console.error('Error parsing recipe:', error);
    res.status(500).json({ error: 'Failed to parse recipe' });
  }
});

app.listen(PORT, () => {
  console.log(`🍳 KH Recipes server running at http://localhost:${PORT}`);
  console.log(`   Storage: ${USE_S3 ? 'S3' : 'Local file'}`);
  console.log(`   Passkey: ${process.env.PASSKEY ? 'Set ✓' : 'NOT SET ✗'}`);
  console.log(`   Anthropic API: ${process.env.ANTHROPIC_API_KEY ? 'Set ✓' : 'NOT SET ✗'}`);
});
