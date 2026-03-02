import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchRecipesPublic } from '../api';

export default function PublicRecipeView() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipesPublic()
      .then(data => {
        const found = (data.recipes || []).find(r => r.id === id);
        setRecipe(found || null);
      })
      .catch(() => setRecipe(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <div className="inline-block w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-amber-700">Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-amber-800">Recipe not found</p>
        <Link to="/read" className="text-amber-600 hover:underline">
          ← Back to recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <Link
          to="/read"
          className="p-2 -ml-2 text-amber-700 hover:text-amber-900"
        >
          ← Back
        </Link>
      </header>

      {/* Recipe Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white">
          <h2 className="text-2xl font-bold">{recipe.name}</h2>
          {recipe.description && (
            <p className="mt-1 opacity-90">{recipe.description}</p>
          )}
          {recipe.category && (
            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
              {recipe.category}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="flex border-b border-gray-100 divide-x divide-gray-100">
          <div className="flex-1 py-3 px-4 text-center">
            <div className="text-xs text-gray-500">Prep</div>
            <div className="font-semibold text-gray-800">{recipe.prepTime || '—'}</div>
          </div>
          <div className="flex-1 py-3 px-4 text-center">
            <div className="text-xs text-gray-500">Cook</div>
            <div className="font-semibold text-gray-800">{recipe.cookTime || '—'}</div>
          </div>
          <div className="flex-1 py-3 px-4 text-center">
            <div className="text-xs text-gray-500">Serves</div>
            <div className="font-semibold text-gray-800">{recipe.servings || '—'}</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Ingredients */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🥗 Ingredients
            </h3>
            <ul className="space-y-2">
              {recipe.ingredients?.map((ing, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{ing}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              📝 Instructions
            </h3>
            <ol className="space-y-4">
              {recipe.instructions?.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
