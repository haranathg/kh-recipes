import { Link } from 'react-router-dom';

const CATEGORY_EMOJI = {
  'Breakfast': '🍳',
  'Mains': '🍽️',
  'Sides': '🥗',
  'Desserts': '🍰',
  'Snacks': '🍿',
  'Drinks': '🥤',
  'Sauces & Dips': '🫙',
  'Other': '📝',
};

export default function RecipeCard({ recipe }) {
  const emoji = CATEGORY_EMOJI[recipe.category] || '📝';
  
  // Combine prep and cook time for display
  const timeInfo = [recipe.prepTime, recipe.cookTime]
    .filter(Boolean)
    .join(' + ');

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {recipe.name}
          </h3>
          {recipe.description && (
            <p className="text-gray-500 text-sm truncate mt-0.5">
              {recipe.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {timeInfo && <span>⏱️ {timeInfo}</span>}
            {recipe.servings && <span>👥 {recipe.servings}</span>}
            {recipe.category && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                {recipe.category}
              </span>
            )}
          </div>
        </div>
        <span className="text-gray-300">›</span>
      </div>
    </Link>
  );
}
