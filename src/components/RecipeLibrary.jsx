import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { clearPasskey } from '../api';

const CATEGORY_EMOJI = {
  'Breakfast': '🍳',
  'Mains': '🍽️',
  'Sides': '🥗',
  'Desserts': '🍰',
  'Snacks': '🍿',
  'Drinks': '🥤',
  'Sauces & Dips': '🫙',
  'Powders': '🧂',
  'Temple Recipes': '🪷',
  'Other': '📝',
};

const CATEGORY_ORDER = [
  'Breakfast',
  'Mains',
  'Sides',
  'Desserts',
  'Snacks',
  'Drinks',
  'Sauces & Dips',
  'Powders',
  'Temple Recipes',
  'Other'
];

export default function RecipeLibrary({ recipes, loading, error, syncing, onLogout }) {
  const [search, setSearch] = useState('');

  // Filter recipes based on search
  const filteredRecipes = useMemo(() => {
    if (!search.trim()) return recipes;

    const searchLower = search.toLowerCase();
    return recipes.filter(recipe => {
      const matchesName = recipe.name?.toLowerCase().includes(searchLower);
      const matchesDesc = recipe.description?.toLowerCase().includes(searchLower);
      const matchesIngredients = recipe.ingredients?.some(ing =>
        ing.toLowerCase().includes(searchLower)
      );
      return matchesName || matchesDesc || matchesIngredients;
    });
  }, [recipes, search]);

  // Group recipes by category
  const recipesByCategory = useMemo(() => {
    const grouped = {};
    filteredRecipes.forEach(recipe => {
      const cat = recipe.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(recipe);
    });
    // Sort recipes alphabetically within each category
    Object.keys(grouped).forEach(cat => {
      grouped[cat].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });
    return grouped;
  }, [filteredRecipes]);

  // Get categories in order
  const orderedCategories = useMemo(() => {
    return CATEGORY_ORDER.filter(cat => recipesByCategory[cat]?.length > 0);
  }, [recipesByCategory]);

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
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search recipes..."
          className="w-full px-4 py-3 bg-white border-2 border-transparent rounded-xl shadow-sm focus:outline-none focus:border-amber-400 transition-colors"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-xl text-amber-800 text-sm">
          {error}
        </div>
      )}

      {/* Recipe Index */}
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
              <p className="text-amber-600 mt-2">Try a different search term</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {orderedCategories.map((category, catIndex) => (
            <div key={category}>
              {/* Category Header */}
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                <span>{CATEGORY_EMOJI[category] || '📝'}</span>
                <span className="font-semibold text-amber-900">{category}</span>
                <span className="text-amber-500 text-sm">({recipesByCategory[category].length})</span>
              </div>
              {/* Recipe List */}
              <ul>
                {recipesByCategory[category].map((recipe) => (
                  <li key={recipe.id}>
                    <Link
                      to={`/recipe/${recipe.id}`}
                      className="flex items-center px-4 py-2.5 hover:bg-amber-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-gray-700 flex-1">{recipe.name}</span>
                      <span className="text-gray-300 text-sm">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {catIndex < orderedCategories.length - 1 && (
                <div className="border-b-2 border-amber-100"></div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recipe count */}
      {!loading && filteredRecipes.length > 0 && (
        <p className="text-center text-sm text-amber-600 mt-4">
          {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
