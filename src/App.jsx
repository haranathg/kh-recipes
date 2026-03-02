import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { hasPasskey } from './api';
import { useRecipes } from './hooks/useRecipes';
import PasskeyGate from './components/PasskeyGate';
import RecipeLibrary from './components/RecipeLibrary';
import AddRecipe from './components/AddRecipe';
import RecipeView from './components/RecipeView';
import RecipeEdit from './components/RecipeEdit';
import PublicRecipeLibrary from './components/PublicRecipeLibrary';
import PublicRecipeView from './components/PublicRecipeView';

function AuthenticatedApp() {
  const [authenticated, setAuthenticated] = useState(hasPasskey());
  const recipeState = useRecipes();

  useEffect(() => {
    setAuthenticated(hasPasskey());
  }, []);

  const handleAuth = () => {
    setAuthenticated(true);
    recipeState.loadRecipes();
  };

  const handleLogout = () => {
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <PasskeyGate onSuccess={handleAuth} />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RecipeLibrary
            {...recipeState}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/add"
        element={
          <AddRecipe
            onSave={recipeState.addRecipe}
          />
        }
      />
      <Route
        path="/recipe/:id"
        element={
          <RecipeView
            getRecipe={recipeState.getRecipe}
            onDelete={recipeState.deleteRecipe}
          />
        }
      />
      <Route
        path="/recipe/:id/edit"
        element={
          <RecipeEdit
            getRecipe={recipeState.getRecipe}
            onSave={recipeState.updateRecipe}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const location = useLocation();
  const isPublicRoute = location.pathname.startsWith('/read');

  if (isPublicRoute) {
    return (
      <div className="min-h-screen safe-area-top safe-area-bottom">
        <Routes>
          <Route path="/read" element={<PublicRecipeLibrary />} />
          <Route path="/read/:id" element={<PublicRecipeView />} />
          <Route path="*" element={<Navigate to="/read" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen safe-area-top safe-area-bottom">
      <AuthenticatedApp />
    </div>
  );
}
