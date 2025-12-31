const API_BASE = '/api';

// Get passkey from localStorage
function getPasskey() {
  return localStorage.getItem('kh-passkey') || '';
}

// Set passkey in localStorage
export function setPasskey(passkey) {
  localStorage.setItem('kh-passkey', passkey);
}

// Clear passkey
export function clearPasskey() {
  localStorage.removeItem('kh-passkey');
}

// Check if passkey is set
export function hasPasskey() {
  return !!localStorage.getItem('kh-passkey');
}

// API headers with passkey
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-passkey': getPasskey(),
  };
}

// Verify passkey with server
export async function verifyPasskey(passkey) {
  const response = await fetch(`${API_BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passkey }),
  });
  
  if (!response.ok) {
    throw new Error('Invalid passkey');
  }
  
  setPasskey(passkey);
  return true;
}

// Fetch all recipes
export async function fetchRecipes() {
  const response = await fetch(`${API_BASE}/recipes`, {
    headers: getHeaders(),
  });
  
  if (response.status === 401) {
    clearPasskey();
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch recipes');
  }
  
  return response.json();
}

// Save all recipes
export async function saveRecipes(data) {
  const response = await fetch(`${API_BASE}/recipes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  
  if (response.status === 401) {
    clearPasskey();
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    throw new Error('Failed to save recipes');
  }
  
  return response.json();
}

// Parse recipe text with Claude
export async function parseRecipe(text) {
  const response = await fetch(`${API_BASE}/parse`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ text }),
  });
  
  if (response.status === 401) {
    clearPasskey();
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to parse recipe');
  }
  
  return response.json();
}
