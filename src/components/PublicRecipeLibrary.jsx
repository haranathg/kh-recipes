import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchRecipesPublic } from '../api';

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

export default function PublicRecipeLibrary() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchRecipesPublic()
      .then(data => setRecipes(data.recipes || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const usedCategories = useMemo(() => {
    const used = new Set(recipes.map(r => r.category).filter(Boolean));
    return ['All', ...CATEGORY_ORDER.filter(cat => used.has(cat))];
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      if (selectedCategory !== 'All' && recipe.category !== selectedCategory) {
        return false;
      }
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        const matchesName = recipe.name?.toLowerCase().includes(searchLower);
        const matchesDesc = recipe.description?.toLowerCase().includes(searchLower);
        const matchesIngredients = recipe.ingredients?.some(ing =>
          ing.toLowerCase().includes(searchLower)
        );
        return matchesName || matchesDesc || matchesIngredients;
      }
      return true;
    });
  }, [recipes, search, selectedCategory]);

  const recipesByCategory = useMemo(() => {
    const grouped = {};
    filteredRecipes.forEach(recipe => {
      const cat = recipe.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(recipe);
    });
    Object.keys(grouped).forEach(cat => {
      grouped[cat].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });
    return grouped;
  }, [filteredRecipes]);

  const orderedCategories = useMemo(() => {
    return CATEGORY_ORDER.filter(cat => recipesByCategory[cat]?.length > 0);
  }, [recipesByCategory]);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearch('');
    }
  };

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">🍳 KH Family Recipes</h1>
          <p className="text-xs text-amber-600">Read-only view</p>
        </div>
        <button
          onClick={toggleSearch}
          className={`p-2 rounded-xl transition-colors ${
            showSearch ? 'bg-amber-100 text-amber-700' : 'text-amber-700 hover:text-amber-900'
          }`}
          title="Search"
        >
          🔍
        </button>
      </header>

      {/* Search (collapsible) */}
      {showSearch && (
        <div className="mb-4">
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="w-full px-4 py-3 bg-white border-2 border-transparent rounded-xl shadow-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      )}

      {/* Category Pills */}
      {usedCategories.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
          {usedCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-amber-800 hover:bg-amber-100'
              }`}
            >
              {category === 'All' ? 'All' : `${CATEGORY_EMOJI[category] || ''} ${category}`}
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
                      to={`/read/${recipe.id}`}
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
