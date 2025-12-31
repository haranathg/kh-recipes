import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { clearPasskey } from '../api';
import RecipeCard from './RecipeCard';

const ALL_CATEGORIES = [
  'All',
  'Breakfast',
  'Mains',
  'Sides',
  'Desserts',
  'Snacks',
  'Drinks',
  'Sauces & Dips',
  'Other'
];

export default function RecipeLibrary({ recipes, loading, error, syncing, onLogout }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter recipes based on search and category
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      // Category filter
      if (selectedCategory !== 'All' && recipe.category !== selectedCategory) {
        return false;
      }
      
      // Search filter
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        const matchesName = recipe.name?.toLowerCase().includes(searchLower);
        const matchesDesc = recipe.description?.toLowerCase().includes(searchLower);
        const matchesIngredients = recipe.ingredients?.some(ing => 
          ing.toLowerCase().includes(searchLower)
        );
        
        if (!matchesName && !matchesDesc && !matchesIngredients) {
          return false;
        }
      }
      
      return true;
    });
  }, [recipes, search, selectedCategory]);

  // Get categories that have recipes
  const usedCategories = useMemo(() => {
    const used = new Set(recipes.map(r => r.category).filter(Boolean));
    return ALL_CATEGORIES.filter(cat => cat === 'All' || used.has(cat));
  }, [recipes]);

  const handleLogout = () => {
    clearPasskey();
    onLogout();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">🍳 KH Recipes</h1>
          {syncing && (
            <p className="text-xs text-amber-600">Syncing...</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/add"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
          >
            + Add
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-amber-700 hover:text-amber-900"
            title="Logout"
          >
            🚪
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search recipes..."
          className="w-full px-4 py-3 bg-white border-2 border-transparent rounded-xl shadow-sm focus:outline-none focus:border-amber-400 transition-colors"
        />
      </div>

      {/* Category Pills */}
      {usedCategories.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
          {usedCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-amber-800 hover:bg-amber-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-xl text-amber-800 text-sm">
          {error}
        </div>
      )}

      {/* Recipe List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-amber-700">Loading recipes...</p>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          {recipes.length === 0 ? (
            <>
              <div className="text-5xl mb-4">📝</div>
              <p className="text-amber-800 font-medium">No recipes yet!</p>
              <p className="text-amber-600 mt-2">Tap "+ Add" to create your first recipe</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-amber-800 font-medium">No recipes found</p>
              <p className="text-amber-600 mt-2">Try a different search or category</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
