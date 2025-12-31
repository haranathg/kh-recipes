import { useState } from 'react';

export default function RecipePreview({ recipe, onSave, onBack, categories }) {
  const [category, setCategory] = useState(recipe.category || 'Other');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      ...recipe,
      category,
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-amber-700 hover:text-amber-900"
        >
          ← Edit Transcript
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save ✓'}
        </button>
      </header>

      {/* Category Picker */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-amber-800 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-400"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Recipe Card Preview */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white">
          <h2 className="text-2xl font-bold">{recipe.name}</h2>
          {recipe.description && (
            <p className="mt-1 opacity-90">{recipe.description}</p>
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

      {/* Note */}
      <p className="mt-4 text-center text-sm text-amber-700">
        Review the recipe above. You can go back to edit the transcript if needed.
      </p>
    </div>
  );
}
