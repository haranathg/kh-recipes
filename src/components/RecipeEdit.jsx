import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const CATEGORIES = [
  'Breakfast',
  'Mains',
  'Sides',
  'Desserts',
  'Snacks',
  'Drinks',
  'Sauces & Dips',
  'Other'
];

export default function RecipeEdit({ getRecipe, onSave }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const originalRecipe = getRecipe(id);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Other',
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: [],
    instructions: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (originalRecipe) {
      setForm({
        name: originalRecipe.name || '',
        description: originalRecipe.description || '',
        category: originalRecipe.category || 'Other',
        prepTime: originalRecipe.prepTime || '',
        cookTime: originalRecipe.cookTime || '',
        servings: originalRecipe.servings || '',
        ingredients: originalRecipe.ingredients || [],
        instructions: originalRecipe.instructions || [],
      });
    }
  }, [originalRecipe]);

  if (!originalRecipe) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-amber-800">Recipe not found</p>
        <Link to="/" className="text-amber-600 hover:underline">
          ← Back to library
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Recipe name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave(id, form);
      navigate(`/recipe/${id}`);
    } catch (err) {
      setError('Failed to save recipe');
      setSaving(false);
    }
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...form.ingredients];
    newIngredients[index] = value;
    setForm({ ...form, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setForm({ ...form, ingredients: [...form.ingredients, ''] });
  };

  const removeIngredient = (index) => {
    const newIngredients = form.ingredients.filter((_, i) => i !== index);
    setForm({ ...form, ingredients: newIngredients });
  };

  const updateInstruction = (index, value) => {
    const newInstructions = [...form.instructions];
    newInstructions[index] = value;
    setForm({ ...form, instructions: newInstructions });
  };

  const addInstruction = () => {
    setForm({ ...form, instructions: [...form.instructions, ''] });
  };

  const removeInstruction = (index) => {
    const newInstructions = form.instructions.filter((_, i) => i !== index);
    setForm({ ...form, instructions: newInstructions });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <Link
          to={`/recipe/${id}`}
          className="p-2 -ml-2 text-amber-700 hover:text-amber-900"
        >
          ← Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save ✓'}
        </button>
      </header>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipe Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-400"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Times & Servings */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prep Time
            </label>
            <input
              type="text"
              value={form.prepTime}
              onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
              placeholder="15 mins"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cook Time
            </label>
            <input
              type="text"
              value={form.cookTime}
              onChange={(e) => setForm({ ...form, cookTime: e.target.value })}
              placeholder="30 mins"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servings
            </label>
            <input
              type="text"
              value={form.servings}
              onChange={(e) => setForm({ ...form, servings: e.target.value })}
              placeholder="4 servings"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Ingredients
            </label>
            <button
              onClick={addIngredient}
              className="text-sm text-amber-600 hover:text-amber-800 font-medium"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {form.ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={ing}
                  onChange={(e) => updateIngredient(i, e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm"
                  placeholder="e.g., 2 cups flour"
                />
                <button
                  onClick={() => removeIngredient(i)}
                  className="px-3 py-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Instructions
            </label>
            <button
              onClick={addInstruction}
              className="text-sm text-amber-600 hover:text-amber-800 font-medium"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {form.instructions.map((step, i) => (
              <div key={i} className="flex gap-2">
                <span className="w-7 h-9 flex items-center justify-center text-amber-600 font-medium">
                  {i + 1}.
                </span>
                <textarea
                  value={step}
                  onChange={(e) => updateInstruction(i, e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm resize-none"
                  rows={2}
                  placeholder="Describe this step..."
                />
                <button
                  onClick={() => removeInstruction(i)}
                  className="px-3 py-2 text-red-500 hover:text-red-700 self-start"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
