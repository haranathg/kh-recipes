import { useState, useEffect, useCallback } from 'react';
import { fetchRecipes, saveRecipes as saveToServer } from '../api';

const LOCAL_STORAGE_KEY = 'kh-recipes-cache';

export function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Load recipes on mount
  useEffect(() => {
    loadRecipes();
  }, []);

  // Load from server (with local cache fallback)
  const loadRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from server
      const data = await fetchRecipes();
      setRecipes(data.recipes || []);
      // Cache locally
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to load from server:', err);
      
      // Fall back to local cache
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        setRecipes(data.recipes || []);
      }
      
      if (err.message !== 'Unauthorized') {
        setError('Working offline - changes will sync when connection is restored');
      } else {
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  // Save to server and update local state
  const saveRecipes = useCallback(async (newRecipes) => {
    setRecipes(newRecipes);
    
    const data = { recipes: newRecipes };
    
    // Save to local cache immediately
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    
    // Sync to server
    setSyncing(true);
    try {
      await saveToServer(data);
    } catch (err) {
      console.error('Failed to sync to server:', err);
      setError('Saved locally - will sync when connection is restored');
    } finally {
      setSyncing(false);
    }
  }, []);

  // Add a new recipe
  const addRecipe = useCallback(async (recipe) => {
    const newRecipe = {
      ...recipe,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const newRecipes = [...recipes, newRecipe];
    await saveRecipes(newRecipes);
    
    return newRecipe;
  }, [recipes, saveRecipes]);

  // Update an existing recipe
  const updateRecipe = useCallback(async (id, updates) => {
    const newRecipes = recipes.map(recipe => 
      recipe.id === id 
        ? { ...recipe, ...updates, updatedAt: new Date().toISOString() }
        : recipe
    );
    
    await saveRecipes(newRecipes);
  }, [recipes, saveRecipes]);

  // Delete a recipe
  const deleteRecipe = useCallback(async (id) => {
    const newRecipes = recipes.filter(recipe => recipe.id !== id);
    await saveRecipes(newRecipes);
  }, [recipes, saveRecipes]);

  // Get a single recipe by ID
  const getRecipe = useCallback((id) => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

  // Get unique categories from recipes
  const categories = [...new Set(recipes.map(r => r.category).filter(Boolean))];

  return {
    recipes,
    loading,
    error,
    syncing,
    loadRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    getRecipe,
    categories,
  };
}
