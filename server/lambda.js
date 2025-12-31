import Anthropic from '@anthropic-ai/sdk';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const S3_BUCKET = process.env.S3_BUCKET;
const PASSKEY = process.env.PASSKEY;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-passkey',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Response helper
function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
    body: JSON.stringify(body),
  };
}

// Check passkey
function checkPasskey(event) {
  const passkey = event.headers?.['x-passkey'] || event.headers?.['X-Passkey'];
  return passkey === PASSKEY;
}

// Get recipes from S3
async function getRecipes() {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: 'recipes.json',
    });
    const result = await s3Client.send(command);
    const body = await result.Body.transformToString();
    return JSON.parse(body);
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      return { recipes: [], updatedAt: new Date().toISOString() };
    }
    throw error;
  }
}

// Save recipes to S3
async function saveRecipes(data) {
  data.updatedAt = new Date().toISOString();
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: 'recipes.json',
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json',
  });
  await s3Client.send(command);
  return data;
}

// Parse recipe with Claude
async function parseRecipe(text) {
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
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('Could not parse recipe');
}

// Lambda handler
export async function handler(event) {
  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  const method = event.requestContext?.http?.method || event.httpMethod;
  let path = event.requestContext?.http?.path || event.path;

  // Normalize path - remove /prod prefix if present
  if (path.startsWith('/prod')) {
    path = path.substring(5);
  }

  try {
    // Auth endpoint
    if (path === '/api/auth' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (body.passkey === PASSKEY) {
        return response(200, { success: true });
      }
      return response(401, { error: 'Invalid passkey' });
    }

    // All other endpoints require passkey
    if (!checkPasskey(event)) {
      return response(401, { error: 'Invalid passkey' });
    }

    // Get recipes
    if (path === '/api/recipes' && method === 'GET') {
      const data = await getRecipes();
      return response(200, data);
    }

    // Save recipes
    if (path === '/api/recipes' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const data = await saveRecipes(body);
      return response(200, data);
    }

    // Parse recipe
    if (path === '/api/parse' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (!body.text) {
        return response(400, { error: 'No recipe text provided' });
      }
      const recipe = await parseRecipe(body.text);
      return response(200, recipe);
    }

    return response(404, { error: 'Not found' });
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: error.message || 'Internal server error' });
  }
}
