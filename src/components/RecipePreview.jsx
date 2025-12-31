import { useState } from 'react';

export default function RecipePreview({ recipe, onSave, onBack, categories }) {
  const [editedRecipe, setEditedRecipe] = useState({
    name: recipe.name || '',
    description: recipe.description || '',
    prepTime: recipe.prepTime || '',
    cookTime: recipe.cookTime || '',
    servings: recipe.servings || '',
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    category: recipe.category || 'Other',
  });
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(editedRecipe);
  };

  const updateField = (field, value) => {
    setEditedRecipe(prev => ({ ...prev, [field]: value }));
  };

  const updateIngredient = (index, value) => {
    setEditedRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing)
    }));
  };

  const removeIngredient = (index) => {
    setEditedRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addIngredient = () => {
    setEditedRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const updateInstruction = (index, value) => {
    setEditedRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.map((step, i) => i === index ? value : step)
    }));
  };

  const removeInstruction = (index) => {
    setEditedRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const addInstruction = () => {
    setEditedRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
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
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 font-medium rounded-xl transition-colors ${
              isEditing
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isEditing ? 'Done Editing' : 'Edit'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save ✓'}
          </button>
        </div>
      </header>

      {/* Category Picker */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-amber-800 mb-2">
          Category
        </label>
        <select
          value={editedRecipe.category}
          onChange={(e) => updateField('category', e.target.value)}
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
          {isEditing ? (
            <>
              <input
                type="text"
                value={editedRecipe.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full text-2xl font-bold bg-white/20 rounded-lg px-2 py-1 placeholder-white/70"
                placeholder="Recipe name"
              />
              <input
                type="text"
                value={editedRecipe.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full mt-2 bg-white/20 rounded-lg px-2 py-1 placeholder-white/70"
                placeholder="Description"
              />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{editedRecipe.name}</h2>
              {editedRecipe.description && (
                <p className="mt-1 opacity-90">{editedRecipe.description}</p>
              )}
            </>
          )}
        </div>

        {/* Meta */}
        <div className="flex border-b border-gray-100 divide-x divide-gray-100">
          <div className="flex-1 py-3 px-4 text-center">
            <div className="text-xs text-gray-500">Prep</div>
            {isEditing ? (
              <input
                type="text"
                value={editedRecipe.prepTime}
                onChange={(e) => updateField('prepTime', e.target.value)}
                className="w-full text-center font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-amber-400"
                placeholder="—"
              />
            ) : (
              <div className="font-semibold text-gray-800">{editedRecipe.prepTime || '—'}</div>
            )}
          </div>
          <div className="flex-1 py-3 px-4 text-center">
            <div className="text-xs text-gray-500">Cook</div>
            {isEditing ? (
              <input
                type="text"
                value={editedRecipe.cookTime}
                onChange={(e) => updateField('cookTime', e.target.value)}
                className="w-full text-center font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-amber-400"
                placeholder="—"
              />
            ) : (
              <div className="font-semibold text-gray-800">{editedRecipe.cookTime || '—'}</div>
            )}
          </div>
          <div className="flex-1 py-3 px-4 text-center">
            <div className="text-xs text-gray-500">Serves</div>
            {isEditing ? (
              <input
                type="text"
                value={editedRecipe.servings}
                onChange={(e) => updateField('servings', e.target.value)}
                className="w-full text-center font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-amber-400"
                placeholder="—"
              />
            ) : (
              <div className="font-semibold text-gray-800">{editedRecipe.servings || '—'}</div>
            )}
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
              {editedRecipe.ingredients?.map((ing, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mt-3 flex-shrink-0"></span>
                  {isEditing ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={ing}
                        onChange={(e) => updateIngredient(i, e.target.value)}
                        className="flex-1 text-gray-700 border-b border-gray-300 focus:outline-none focus:border-amber-400 py-1"
                      />
                      <button
                        onClick={() => removeIngredient(i)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-700">{ing}</span>
                  )}
                </li>
              ))}
            </ul>
            {isEditing && (
              <button
                onClick={addIngredient}
                className="mt-3 text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                + Add ingredient
              </button>
            )}
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              📝 Instructions
            </h3>
            <ol className="space-y-4">
              {editedRecipe.instructions?.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    {i + 1}
                  </span>
                  {isEditing ? (
                    <div className="flex-1 flex gap-2">
                      <textarea
                        value={step}
                        onChange={(e) => updateInstruction(i, e.target.value)}
                        className="flex-1 text-gray-700 border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-amber-400 resize-none"
                        rows={2}
                      />
                      <button
                        onClick={() => removeInstruction(i)}
                        className="text-red-500 hover:text-red-700 px-2 self-start"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-700 pt-0.5">{step}</p>
                  )}
                </li>
              ))}
            </ol>
            {isEditing && (
              <button
                onClick={addInstruction}
                className="mt-3 text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                + Add step
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Note */}
      <p className="mt-4 text-center text-sm text-amber-700">
        {isEditing
          ? 'Tap on any field to edit it. Tap "Done Editing" when finished.'
          : 'Review the recipe above. Tap "Edit" to make changes, or "Save" when ready.'}
      </p>
    </div>
  );
}
